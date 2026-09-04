"""
Google Gemini AI client.
Mirrors the GoogleGenAI setup in config/gemini.js.
"""

import logging

from google import genai

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

MODEL_NAME = "gemini-2.5-flash"


def get_gemini_client() -> genai.Client:
    """
    Returns the singleton Gemini client instance.
    Initializes on first access.
    """
    global _client
    if _client is None:
        _client = _create_client()
    return _client


def _create_client() -> genai.Client:
    """Creates a new Google GenAI client."""
    settings = get_settings()

    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is missing in environment variables.")

    return genai.Client(api_key=settings.GEMINI_API_KEY)


def init_gemini_client() -> None:
    """Initialize the Gemini client at application startup."""
    global _client
    _client = _create_client()
    logger.info("Gemini AI client initialized")


async def generate_content(prompt: str) -> str:
    """
    Generate content using Gemini.

    Args:
        prompt: The text prompt to send to Gemini.

    Returns:
        The generated text response.
    """
    client = get_gemini_client()

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )

    return response.text or ""
