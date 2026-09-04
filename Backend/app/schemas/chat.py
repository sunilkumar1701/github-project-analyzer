"""
Chat-related Pydantic schemas.
"""

from pydantic import BaseModel
from typing import Any, Optional


class ChatRequest(BaseModel):
    """Chat request body — matches the POST /api/chat body from frontend."""
    username: str
    message: str
    dashboardContext: Optional[dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Chat response — matches { success, source, answer }."""
    success: bool = True
    source: str = "mcp"
    answer: str = ""
