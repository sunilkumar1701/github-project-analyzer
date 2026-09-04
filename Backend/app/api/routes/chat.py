"""
Chat API route.
Port of routes/chat.routes.js.

Mounted at /api/chat in main.py.
"""

from fastapi import APIRouter

from app.schemas.chat import ChatRequest
from app.controllers.chat_controller import handle_chat_with_github

router = APIRouter()


@router.post("")
async def chat_with_github(request: ChatRequest):
    """
    POST /api/chat

    Request body:
        { username, message, dashboardContext? }

    Response:
        { success, source, answer }
    """
    return await handle_chat_with_github(
        username=request.username,
        message=request.message,
        dashboard_context=request.dashboardContext,
    )
