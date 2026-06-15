"""
Singleton Supabase client for Vani AI backend.
Uses the service role key to bypass RLS from the server side.
"""

import os
import logging
from supabase import create_client, Client

logger = logging.getLogger("vani-ai.supabase")

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """
    Returns a singleton Supabase client instance.
    Uses SUPABASE_URL and SUPABASE_SERVICE_KEY from environment variables.
    The service role key bypasses Row Level Security (RLS) so the backend
    can read/write all tenant data without per-user auth tokens.
    """
    global _supabase_client

    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")

        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables."
            )

        _supabase_client = create_client(url, key)
        logger.info("Supabase client initialized successfully.")

    return _supabase_client
