import os
import json
import time
import logging
from fastapi import FastAPI, HTTPException, Response, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from livekit import api
from db.supabase_client import get_supabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vani-ai.dispatch")

app = FastAPI(
    title="Vani AI Dispatch Service",
    description="FastAPI service for call dispatching and Plivo webhooks.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OutboundCallRequest(BaseModel):
    agent_id: str
    phone_number: str
    user_id: str

@app.post("/api/calls/outbound")
async def outbound_call(req: OutboundCallRequest):
    url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")

    if not (url and api_key and api_secret):
        logger.error("LiveKit credentials missing in environment variables.")
        raise HTTPException(status_code=500, detail="LiveKit credentials missing in environment variables.")

    timestamp = int(time.time())
    room_name = f"call-{req.agent_id}-{timestamp}"
    logger.info(f"Outbound call request received. Room: {room_name} | Agent: {req.agent_id} | Phone: {req.phone_number}")

    lk_api = api.LiveKitAPI(url=url, api_key=api_key, api_secret=api_secret)

    try:
        metadata_dict = {
            "phone_number": req.phone_number,
            "agent_id": req.agent_id,
            "user_id": req.user_id
        }

        dispatch_request = api.CreateAgentDispatchRequest(
            agent_name="vani-ai-worker",
            room=room_name,
            metadata=json.dumps(metadata_dict)
        )

        dispatch = await lk_api.agent_dispatch.create_dispatch(dispatch_request)
        logger.info(f"Outbound dispatch successful. Dispatch ID: {dispatch.id}")
        
        return {
            "success": True,
            "room_name": room_name,
            "dispatch_id": dispatch.id,
            "message": "Outbound call dispatched successfully."
        }
    except Exception as e:
        logger.error(f"Failed to dispatch outbound call: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to dispatch agent: {str(e)}")
    finally:
        await lk_api.aclose()

@app.post("/api/calls/inbound-webhook")
async def inbound_webhook(
    From: str = Form(...),
    To: str = Form(...)
):
    logger.info(f"Inbound webhook received. From: {From} | To: {To}")
    
    sb = get_supabase()
    to_number = To.strip()

    # Query Supabase phone_numbers table for agent_id and user_id by the "To" number
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
        logger.warning(f"No active agent found for dialed number: {to_number}")
        xml = """<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Hangup/>
        </Response>
        """
        return Response(content=xml, media_type="application/xml")

    agent_id = phone_data["agent_id"]
    user_id = phone_data["user_id"]

    timestamp = int(time.time())
    room_name = f"inbound-{agent_id}-{timestamp}"
    logger.info(f"Mapping inbound call. Agent ID: {agent_id} | Assigned Room: {room_name}")

    # Dispatch LiveKit job with agent_id and caller_number (From) in metadata
    url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")

    if not (url and api_key and api_secret):
        logger.error("LiveKit credentials missing in environment variables.")
        xml = """<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Hangup/>
        </Response>
        """
        return Response(content=xml, media_type="application/xml")

    lk_api = api.LiveKitAPI(url=url, api_key=api_key, api_secret=api_secret)

    try:
        metadata_dict = {
            "phone_number": From,
            "agent_id": agent_id,
            "user_id": user_id
        }

        dispatch_request = api.CreateAgentDispatchRequest(
            agent_name="vani-ai-worker",
            room=room_name,
            metadata=json.dumps(metadata_dict)
        )

        await lk_api.agent_dispatch.create_dispatch(dispatch_request)
        logger.info(f"Inbound call agent dispatched for room: {room_name}")

        sip_domain = os.getenv("LIVEKIT_SIP_DOMAIN") or os.getenv("VOBIZ_SIP_DOMAIN") or "sip.livekit.cloud"

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
            <Hangup/>
        </Response>
        """
        return Response(content=xml, media_type="application/xml")
    finally:
        await lk_api.aclose()

@app.get("/health")
def health_check():
    return { "status": "ok", "service": "vani-ai-dispatch" }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", "8000"))
    logger.info(f"Starting Vani AI Dispatch service on port {port}...")
    uvicorn.run("api.dispatch:app", host="0.0.0.0", port=port, reload=False)
