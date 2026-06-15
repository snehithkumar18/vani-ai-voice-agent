from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
import random
import logging
from livekit import api

logger = logging.getLogger("vani-ai.api.dispatch")
router = APIRouter()

class DispatchRequest(BaseModel):
    phone_number: str
    agent_id: str
    user_id: str = None  # optional, can load from agent_config if needed

@router.post("/dispatch")
async def dispatch_call(req: DispatchRequest):
    url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")

    if not (url and api_key and api_secret):
        logger.error("LiveKit credentials missing in environment variables.")
        raise HTTPException(status_code=500, detail="LiveKit credentials missing in environment variables.")

    # Validate phone number
    phone_number = req.phone_number.strip()
    if not phone_number.startswith("+"):
        raise HTTPException(status_code=400, detail="Phone number must start with '+' and country code.")

    # Create a unique room name
    room_name = f"call-{phone_number.replace('+', '')}-{random.randint(1000, 9999)}"
    logger.info(f"Dispatch request received for {phone_number} with Agent {req.agent_id}. Assigned Room: {room_name}")

    # Initialize LiveKit API Client
    lk_api = api.LiveKitAPI(url=url, api_key=api_key, api_secret=api_secret)

    try:
        # Construct metadata containing agent_id and phone_number
        metadata_dict = {
            "phone_number": phone_number,
            "agent_id": req.agent_id
        }
        if req.user_id:
            metadata_dict["user_id"] = req.user_id

        dispatch_request = api.CreateAgentDispatchRequest(
            agent_name="outbound-caller",
            room=room_name,
            metadata=json.dumps(metadata_dict)
        )
        
        dispatch = await lk_api.agent_dispatch.create_dispatch(dispatch_request)
        logger.info(f"Agent dispatch created successfully. Dispatch ID: {dispatch.id}")
        return {
            "status": "success",
            "room_name": room_name,
            "dispatch_id": dispatch.id
        }
    except Exception as e:
        logger.error(f"Failed to dispatch agent: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to dispatch agent: {str(e)}")
    finally:
        await lk_api.aclose()
