"""
Call logger for Vani AI.
Logs call lifecycle events and transcripts to Supabase in real time.
Includes simple keyword-based sentiment detection for Indian languages.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from db.supabase_client import get_supabase

logger = logging.getLogger("vani-ai.call-logger")


class CallLogger:
    """
    Tracks a single call's lifecycle:
      start_call()     → inserts a row into the calls table
      add_transcript() → appends timestamped lines in memory
      end_call()       → updates the row with duration, transcript, sentiment
    """

    def __init__(self, agent_id: str, user_id: str, caller_number: str):
        self.agent_id = agent_id
        self.user_id = user_id
        self.caller_number = caller_number
        self.call_id: Optional[str] = None
        self.transcript_lines: list[str] = []
        self.started_at: Optional[datetime] = None

    async def start_call(self) -> str:
        """Insert a new call record and return the call_id."""
        sb = get_supabase()
        self.started_at = datetime.now(timezone.utc)

        resp = (
            sb.table("calls")
            .insert(
                {
                    "agent_id": self.agent_id,
                    "user_id": self.user_id,
                    "caller_number": self.caller_number,
                    "status": "active",
                    "started_at": self.started_at.isoformat(),
                }
            )
            .execute()
        )

        self.call_id = resp.data[0]["id"]
        logger.info(f"Call started — ID: {self.call_id} | Agent: {self.agent_id} | Caller: {self.caller_number}")
        return self.call_id

    def add_transcript(self, speaker: str, text: str) -> None:
        """Append a timestamped transcript line. Speaker is 'Agent' or 'User'."""
        now = datetime.now(timezone.utc)
        timestamp = now.strftime("%H:%M:%S")
        line = f"[{timestamp}] {speaker.upper()}: {text}"
        self.transcript_lines.append(line)
        logger.debug(f"Transcript: {line}")

    async def end_call(self, status: str = "completed") -> None:
        """Finalize the call record with duration, transcript, and sentiment."""
        if not self.call_id:
            logger.warning("end_call() called but no call_id exists — skipping.")
            return

        sb = get_supabase()
        ended_at = datetime.now(timezone.utc)

        # Calculate duration
        duration_seconds = 0
        if self.started_at:
            duration_seconds = int((ended_at - self.started_at).total_seconds())

        # Join transcript
        full_transcript = "\n".join(self.transcript_lines)

        # Detect sentiment
        sentiment = self._detect_sentiment(full_transcript)

        sb.table("calls").update(
            {
                "status": status,
                "ended_at": ended_at.isoformat(),
                "duration_seconds": duration_seconds,
                "transcript": full_transcript,
                "sentiment": sentiment,
            }
        ).eq("id", self.call_id).execute()

        logger.info(
            f"Call ended — ID: {self.call_id} | Duration: {duration_seconds}s | "
            f"Sentiment: {sentiment} | Status: {status}"
        )

    @staticmethod
    def _detect_sentiment(transcript: str) -> str:
        """
        Simple keyword-based sentiment detection.
        Supports both English and common Hindi/Indian language keywords.
        """
        text_lower = transcript.lower()

        positive_keywords = [
            "thank", "great", "helpful", "excellent", "perfect",
            "satisfied", "happy", "dhanyavaad", "shukriya", "bahut accha",
        ]
        negative_keywords = [
            "angry", "frustrated", "bad", "terrible", "complaint",
            "disappointed", "problem", "issue",
        ]

        positive_hits = sum(1 for kw in positive_keywords if kw in text_lower)
        negative_hits = sum(1 for kw in negative_keywords if kw in text_lower)

        if negative_hits >= 1:
            return "negative"
        if positive_hits >= 2:
            return "positive"
        if positive_hits >= 1:
            return "positive"
        return "neutral"
