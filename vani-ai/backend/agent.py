import os
import certifi

# Fix for macOS SSL Certificate errors - MUST be before other imports
os.environ['SSL_CERT_FILE'] = certifi.where()

import logging
import json
from dotenv import load_dotenv

from livekit import agents, api
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    openai,
    cartesia,
    deepgram,
    noise_cancellation,
    silero,
    sarvam,
)
from livekit.agents import llm
from typing import Annotated, Optional

import config
from db.agent_loader import load_agent_config, AgentConfig
from db.call_logger import CallLogger

# Load environment variables
load_dotenv(".env")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vani-ai-worker")


def build_tts(agent_cfg: AgentConfig):
    """Configure the Text-to-Speech provider to always use Sarvam Bulbul v2."""
    logger.info(f"Using Sarvam Bulbul v2 TTS (Speaker: {agent_cfg.sarvam_speaker})")
    return sarvam.TTS(
        model="bulbul:v2", 
        speaker=agent_cfg.sarvam_speaker, 
        target_language_code=agent_cfg.language_code
    )


def build_llm():
    """Configure the LLM provider to always use Groq Llama-3.3-70b-versatile."""
    logger.info("Using Groq LLM (llama-3.3-70b-versatile)")
    return openai.LLM(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.7,
    )


def build_stt(agent_cfg: AgentConfig):
    """Configure STT using Deepgram Nova-2 or Nova-3 with mapped language code."""
    lang_map = {
        "hi-IN": "hi",
        "te-IN": "te",
        "ta-IN": "ta",
        "en-IN": "en",
    }
    stt_lang_code = lang_map.get(agent_cfg.language_code, "en")
    model = "nova-3" if stt_lang_code == "te" else "nova-2"
    logger.info(f"Using Deepgram {model} STT (Language: {stt_lang_code})")
    return deepgram.STT(model=model, language=stt_lang_code)


class VaniTransferTools(llm.ToolContext):
    def __init__(self, ctx: agents.JobContext, agent_cfg: AgentConfig, call_logger: CallLogger):
        super().__init__(tools=[])
        self.ctx = ctx
        self.agent_cfg = agent_cfg
        self.call_logger = call_logger

    @llm.function_tool(description="Transfer the call to a human support agent or another phone number.")
    async def transfer_call(self, destination: Optional[str] = None):
        """
        Transfer the call.
        """
        if destination is None:
            destination = self.agent_cfg.transfer_number or config.DEFAULT_TRANSFER_NUMBER
            if not destination:
                 return "Error: No default transfer number configured."
        if "@" not in destination:
            # If no domain is provided, append the SIP domain
            if config.SIP_DOMAIN:
                # Ensure clean number (strip tel: or sip: prefix if present but no domain)
                clean_dest = destination.replace("tel:", "").replace("sip:", "")
                destination = f"sip:{clean_dest}@{config.SIP_DOMAIN}"
            else:
                # Fallback to tel URI if no domain configured
                if not destination.startswith("tel:") and not destination.startswith("sip:"):
                     destination = f"tel:{destination}"
        elif not destination.startswith("sip:"):
             destination = f"sip:{destination}"
        
        logger.info(f"Transferring call to {destination}")
        
        # Determine the participant identity
        participant_identity = None
        if self.agent_cfg.phone_number:
            participant_identity = f"sip_{self.agent_cfg.phone_number}"
        else:
            # Try to find a participant that is NOT the agent
            for p in self.ctx.room.remote_participants.values():
                participant_identity = p.identity
                break
        
        if not participant_identity:
            logger.error("Could not determine participant identity for transfer")
            return "Failed to transfer: could not identify the caller."

        try:
            logger.info(f"Transferring participant {participant_identity} to {destination}")
            await self.ctx.api.sip.transfer_sip_participant(
                api.TransferSIPParticipantRequest(
                    room_name=self.ctx.room.name,
                    participant_identity=participant_identity,
                    transfer_to=destination,
                    play_dialtone=False
                )
            )
            return "Transfer initiated successfully."
        except Exception as e:
            logger.error(f"Transfer failed: {e}")
            return f"Error executing transfer: {e}"

    @llm.function_tool(description="Book an appointment for the customer with name, phone number, and preferred date/time.")
    def book_appointment(self, customer_name: str, phone_number: str, preferred_time: str):
        """
        Book an appointment for the customer.

        Args:
            customer_name: The name of the customer.
            phone_number: The phone number of the customer.
            preferred_time: The preferred date and time for the appointment.
        """
        logger.info(f"Booking appointment: Name={customer_name}, Phone={phone_number}, Time={preferred_time}")
        try:
            from db.supabase_client import get_supabase
            sb = get_supabase()
            sb.table("appointments").insert({
                "agent_id": self.agent_cfg.agent_id,
                "user_id": self.agent_cfg.user_id,
                "customer_name": customer_name,
                "phone_number": phone_number,
                "preferred_time": preferred_time
            }).execute()
        except Exception as e:
            logger.error(f"Failed to record appointment in Supabase database: {e}")
            # We still return confirmation to avoid interrupting conversational flow
        
        return f"Appointment successfully booked for {customer_name} at {preferred_time}."


class VaniAgent(Agent):
    """
    Vani AI voice calling agent.
    """
    def __init__(self, tools: list, system_prompt: str) -> None:
        super().__init__(
            instructions=system_prompt,
            tools=tools,
        )


async def entrypoint(ctx: agents.JobContext):
    """
    Main entrypoint for the Vani AI agent.
    """
    logger.info(f"Connecting to room: {ctx.room.name}")
    
    agent_id = None
    phone_number = None
    
    # Step 1: Parse agent_id and phone_number from ctx.job.metadata JSON or ctx.room.metadata fallback
    try:
        if ctx.job.metadata:
            data = json.loads(ctx.job.metadata)
            agent_id = data.get("agent_id")
            phone_number = data.get("phone_number")
    except Exception as e:
        logger.warning(f"Failed to parse job metadata JSON: {e}")
        
    if not agent_id:
        try:
            if ctx.room.metadata:
                data = json.loads(ctx.room.metadata)
                agent_id = data.get("agent_id")
                if data.get("phone_number"):
                    phone_number = data.get("phone_number")
        except Exception as e:
            logger.warning(f"Failed to parse room metadata JSON: {e}")

    if not agent_id:
        try:
            from db.supabase_client import get_supabase
            sb = get_supabase()
            agents_resp = sb.table("agents").select("id").limit(1).execute()
            if agents_resp.data:
                agent_id = agents_resp.data[0]["id"]
                logger.info(f"No agent_id in metadata. Fell back to first database agent ID: {agent_id}")
        except Exception as e:
            logger.warning(f"Failed to fetch fallback agent ID from DB: {e}")

    if not agent_id:
        logger.error("No agent_id found in metadata. Shutting down context.")
        ctx.shutdown()
        return

    # Step 2: Load agent configuration from Supabase
    try:
        agent_cfg = await load_agent_config(agent_id)
    except Exception as e:
        logger.error(f"Failed to load agent configuration for ID {agent_id}: {e}")
        ctx.shutdown()
        return

    # Step 3: Create CallLogger and start call
    call_logger = CallLogger(
        agent_id=agent_cfg.agent_id,
        user_id=agent_cfg.user_id,
        caller_number=phone_number or "unknown"
    )
    try:
        await call_logger.start_call()
    except Exception as e:
        logger.error(f"Failed to start call logging: {e}")

    # Step 4: Create transfer and scheduling tools
    fnc_ctx = VaniTransferTools(ctx, agent_cfg, call_logger)

    # Step 5: Create AgentSession with build functions
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=build_stt(agent_cfg),
        llm=build_llm(),
        tts=build_tts(agent_cfg)
    )

    # Step 6: Hook transcript events
    @session.on("user_speech_committed")
    def on_user_speech(msg):
        text = msg.content if hasattr(msg, "content") else (msg.text if hasattr(msg, "text") else str(msg))
        if text:
            call_logger.add_transcript("USER", text)

    @session.on("agent_speech_committed")
    def on_agent_speech(msg):
        text = msg.content if hasattr(msg, "content") else (msg.text if hasattr(msg, "text") else str(msg))
        if text:
            call_logger.add_transcript("AGENT", text)

    # Step 7: Start session with VaniAgent
    await session.start(
        room=ctx.room,
        agent=VaniAgent(tools=list(fnc_ctx.function_tools.values()), system_prompt=agent_cfg.system_prompt),
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVCTelephony(),
            close_on_disconnect=True
        )
    )

    # Step 8: Determine if outbound call or inbound call
    should_dial = False
    if phone_number:
        # Check if user is already here
        user_already_here = False
        for p in ctx.room.remote_participants.values():
            if "sip_" in p.identity:
                user_already_here = True
                break
        if not user_already_here:
            should_dial = True

    if should_dial:
        logger.info(f"Initiating outbound call to {phone_number}...")
        try:
            sip_trunk_id = agent_cfg.sip_trunk_id or config.SIP_TRUNK_ID
            await ctx.api.sip.create_sip_participant(
                api.CreateSIPParticipantRequest(
                    room_name=ctx.room.name,
                    sip_trunk_id=sip_trunk_id,
                    sip_call_to=phone_number,
                    participant_identity=f"sip_{phone_number}",
                    wait_until_answered=True
                )
            )
            logger.info("Outbound call answered successfully.")
            await session.generate_reply(instructions=agent_cfg.initial_greeting)
        except Exception as e:
            logger.error(f"Failed to place outbound call: {e}")
            try:
                await call_logger.end_call(status="dropped")
            except Exception as log_err:
                logger.error(f"Failed to log call failure: {log_err}")
            ctx.shutdown()
            return
    else:
        logger.info("Inbound call or participant already in room. Greet directly.")
        await session.generate_reply(instructions=agent_cfg.initial_greeting)

    # Step 9: Wait for disconnect and finalize logging in finally block
    try:
        import asyncio
        from livekit import rtc
        while ctx.room.connection_state != rtc.ConnectionState.CONN_DISCONNECTED:
            await asyncio.sleep(1)
    finally:
        logger.info("Agent context shutting down. Saving logs.")
        try:
            await call_logger.end_call(status="completed")
        except Exception as log_err:
            logger.error(f"Failed to save final call logs: {log_err}")


if __name__ == "__main__":
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="vani-ai-worker",
        )
    )
