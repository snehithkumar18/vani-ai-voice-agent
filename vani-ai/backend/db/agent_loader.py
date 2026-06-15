"""
Agent configuration loader for Vani AI.
Loads per-tenant agent configs from Supabase, builds dynamic system prompts,
and maps language/voice selections to provider-specific codes.
"""

import logging
from dataclasses import dataclass, field
from typing import Optional

from db.supabase_client import get_supabase

logger = logging.getLogger("vani-ai.agent-loader")


# ---------------------------------------------------------------------------
# Language code mapping — display name → Sarvam/BCP-47 code
# ---------------------------------------------------------------------------
LANGUAGE_MAP: dict[str, str] = {
    "Hindi": "hi-IN",
    "Telugu": "te-IN",
    "Tamil": "ta-IN",
    "Kannada": "kn-IN",
    "Bengali": "bn-IN",
    "English": "en-IN",
}

# ---------------------------------------------------------------------------
# Voice mapping — friendly label → Sarvam speaker ID
# ---------------------------------------------------------------------------
VOICE_MAP: dict[str, str] = {
    "Female - Warm & Professional": "anushka",
    "Male - Formal & Confident": "aravind",
    "Female - Energetic": "amartya",
    "Male - Deep & Calm": "dhruv",
}


@dataclass
class AgentConfig:
    """Holds all runtime configuration for a single voice agent instance."""

    agent_id: str
    user_id: str
    name: str
    business_type: str
    language: str
    language_code: str
    voice_type: str
    sarvam_speaker: str
    system_prompt: str
    initial_greeting: str
    knowledge_base: str
    phone_number: Optional[str] = None
    sip_trunk_id: Optional[str] = None
    transfer_number: Optional[str] = None


def build_system_prompt(agent_db: dict, kb_text: str) -> str:
    """
    Build a dynamic system prompt from the agent's DB record and
    concatenated knowledge-base text.
    """
    language = agent_db.get("language", "English")
    business_name = agent_db.get("business_name", "our company")
    business_type = agent_db.get("business_type", "business")
    description = agent_db.get("description", "")

    # --- Language-specific instructions ---
    if language == "Hindi":
        lang_instruction = (
            "You MUST always respond in Hindi (Devanagari transliteration is fine). "
            "If the caller speaks English, you may mix but prefer Hindi."
        )
    elif language == "Telugu":
        lang_instruction = (
            "You MUST always respond in Telugu. "
            "If the caller speaks English, you may mix but prefer Telugu."
        )
    elif language == "Tamil":
        lang_instruction = (
            "You MUST always respond in Tamil. "
            "If the caller speaks English, you may mix but prefer Tamil."
        )
    elif language == "Kannada":
        lang_instruction = (
            "You MUST always respond in Kannada. "
            "If the caller speaks English, you may mix but prefer Kannada."
        )
    elif language == "Bengali":
        lang_instruction = (
            "You MUST always respond in Bengali. "
            "If the caller speaks English, you may mix but prefer Bengali."
        )
    else:
        lang_instruction = (
            "Respond in Indian English with a friendly, professional tone. "
            "You may use common Hindi greetings like 'Namaste' naturally."
        )

    # --- Compose the full prompt ---
    prompt = f"""You are a voice AI assistant for "{business_name}", a {business_type}.

{description}

**Language:** {lang_instruction}

**Knowledge Base:**
{kb_text if kb_text else "No specific knowledge base provided. Answer general questions about the business politely."}

**Rules (CRITICAL — follow these on every call):**
1. Keep responses under 2 sentences on phone calls. Be concise and natural.
2. Never admit to being an AI unless directly asked. Act as a real representative.
3. If the user says "bye", "alvida", "goodbye", or any farewell, respond with a warm farewell and end the conversation.
4. Never make up prices, policies, or information not in the knowledge base. Say "Let me connect you with someone who can help" instead.
5. For appointments or bookings, collect: name, phone number, and preferred date/time.
6. Only use the transfer_call tool if the user explicitly asks to speak with a human, manager, or specific person.
7. If the caller is angry or frustrated, remain calm, empathize, and offer to transfer.
"""
    return prompt.strip()


async def load_agent_config(agent_id: str) -> AgentConfig:
    """
    Load a complete agent configuration from Supabase.

    Queries:
      - agents table   → core agent settings
      - knowledge_base → all KB entries for this agent (concatenated)
      - phone_numbers  → active phone number linked to this agent
    """
    sb = get_supabase()

    # --- 1. Load agent record ---
    agent_resp = sb.table("agents").select("*").eq("id", agent_id).single().execute()
    agent_db = agent_resp.data

    if not agent_db:
        raise ValueError(f"Agent not found: {agent_id}")

    logger.info(f"Loaded agent: {agent_db.get('business_name')} (ID: {agent_id})")

    # --- 2. Load knowledge base entries ---
    kb_resp = (
        sb.table("knowledge_base")
        .select("title, content")
        .eq("agent_id", agent_id)
        .execute()
    )
    kb_entries = kb_resp.data or []
    kb_text = "\n\n".join(
        f"### {entry['title']}\n{entry['content']}" for entry in kb_entries
    )

    if kb_entries:
        logger.info(f"Loaded {len(kb_entries)} knowledge base entries for agent {agent_id}")

    # --- 3. Load phone number ---
    phone_resp = (
        sb.table("phone_numbers")
        .select("phone_number, sip_trunk_id")
        .eq("agent_id", agent_id)
        .eq("is_active", True)
        .limit(1)
        .execute()
    )
    phone_data = phone_resp.data[0] if phone_resp.data else {}

    # --- 4. Map language and voice ---
    language = agent_db.get("language", "English")
    language_code = LANGUAGE_MAP.get(language, "en-IN")

    voice_type = agent_db.get("voice_type", "Female - Warm & Professional")
    sarvam_speaker = VOICE_MAP.get(voice_type, "anushka")

    # --- 5. Build system prompt ---
    system_prompt = build_system_prompt(agent_db, kb_text)

    # --- 6. Construct initial greeting ---
    initial_greeting = agent_db.get(
        "initial_greeting",
        f"Greet the caller warmly on behalf of {agent_db.get('business_name', 'our company')}. Introduce yourself and ask how you can help."
    )

    return AgentConfig(
        agent_id=agent_id,
        user_id=agent_db.get("user_id", ""),
        name=agent_db.get("business_name", "Vani Agent"),
        business_type=agent_db.get("business_type", "business"),
        language=language,
        language_code=language_code,
        voice_type=voice_type,
        sarvam_speaker=sarvam_speaker,
        system_prompt=system_prompt,
        initial_greeting=initial_greeting,
        knowledge_base=kb_text,
        phone_number=phone_data.get("phone_number"),
        sip_trunk_id=phone_data.get("sip_trunk_id"),
        transfer_number=agent_db.get("transfer_number"),
    )
