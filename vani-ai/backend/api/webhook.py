from fastapi import APIRouter, Response, Form
import os
import random
import json
import logging
from livekit import api
from db.supabase_client import get_supabase

logger = logging.getLogger("vani-ai.api.webhook")
router = APIRouter()

@router.post("/plivo")
async def plivo_webhook(
    From: str = Form(...),
    To: str = Form(...),
    CallUUID: str = Form(...)
):
    logger.info(f"Plivo inbound webhook triggered. CallUUID: {CallUUID} | From: {From} | To: {To}")
    sb = get_supabase()

    # 1. Resolve agent by dialed number (To)
    to_number = To.strip()
    
    # Query phone_numbers table
    phone_resp = (
        sb.table("phone_numbers")
        .select("agent_id, user_id")
        .eq("number", to_number)
        .eq("status", "active")
        .limit(1)
        .execute()
    )
    
    phone_data = phone_resp.data[0] if phone_resp.data else None
    
    if not phone_data or not phone_data.get("agent_id"):
        logger.warning(f"No active agent assigned to dialed number: {to_number}")
        # If no active agent is linked to this number, reject the call politely
        xml = """<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Speak>Sorry, this number is not assigned to any active virtual agent.</Speak>
            <Hangup/>
        </Response>
        """
        return Response(content=xml, media_type="application/xml")

    agent_id = phone_data["agent_id"]
    user_id = phone_data["user_id"]

    # 2. Generate room name and LiveKit SIP URI
    room_name = f"inbound-{to_number.replace('+', '')}-{From.replace('+', '')}-{random.randint(1000, 9999)}"
    
    # Fallback/default domains
    sip_domain = os.getenv("LIVEKIT_SIP_DOMAIN") or os.getenv("VOBIZ_SIP_DOMAIN")
    if not sip_domain:
        sip_domain = "sip.livekit.cloud"  # default LiveKit cloud SIP domain

    logger.info(f"Resolving inbound call. Room: {room_name} | Agent: {agent_id} | Routing Domain: {sip_domain}")

    # 3. Dispatch LiveKit agent to the room
    url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")

    if not (url and api_key and api_secret):
        logger.error("LiveKit credentials missing in environment variables.")
        xml = """<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Speak>System configuration error. Unable to connect call.</Speak>
            <Hangup/>
        </Response>
        """
        return Response(content=xml, media_type="application/xml")

    lk_api = api.LiveKitAPI(url=url, api_key=api_key, api_secret=api_secret)

    try:
        # Construct metadata containing agent_id and phone_number (From)
        metadata_dict = {
            "phone_number": From,
            "agent_id": agent_id,
            "user_id": user_id
        }

        dispatch_request = api.CreateAgentDispatchRequest(
            agent_name="outbound-caller",
            room=room_name,
            metadata=json.dumps(metadata_dict)
        )
        
        await lk_api.agent_dispatch.create_dispatch(dispatch_request)
        logger.info(f"Agent dispatch successful for room: {room_name}")
        
        # 4. Return Plivo XML to Dial the LiveKit Room SIP URI
        xml = f"""<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Dial>
                <SIP>sip:{room_name}@{sip_domain}</SIP>
            </Dial>
        </Response>
        """
        return Response(content=xml, media_type="application/xml")
    except Exception as e:
        logger.error(f"Error dispatching agent on inbound webhook: {e}")
        xml = """<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Speak>Error dispatching voice agent. Please try again later.</Speak>
            <Hangup/>
        </Response>
        """
        return Response(content=xml, media_type="application/xml")
    finally:
        await lk_api.aclose()
