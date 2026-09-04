"""
Chat controller.
Port of controllers/chat.controller.js.
"""

from app.utils.tool_router import determine_source
from app.services.chat_service import process_question


async def handle_chat_with_github(
    username: str,
    message: str,
    dashboard_context: dict | None = None,
) -> dict:
    """
    Handle POST /api/chat

    Validates input, determines source (dashboard vs MCP),
    and processes the question.

    Returns:
        { success: true, source: "dashboard"|"mcp", answer: "..." }
    """
    if not username or not message:
        raise ValueError("Username and message are required.")

    source = determine_source(message)

    result = await process_question(
        username=username,
        source=source,
        dashboard_context=dashboard_context,
        question=message,
    )

    return {
        "success": True,
        "source": result.get("source", "mcp"),
        "answer": result.get("answer", ""),
    }
