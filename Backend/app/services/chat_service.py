"""
Chat service — orchestrates the chat flow.
Port of services/chat.service.js.
"""

import logging

from app.services.mcp_service import execute_mcp_tool
from app.services.gemini_service import select_tool_with_gemini
from app.services.answer_generation_service import generate_answer, generate_error_answer

logger = logging.getLogger(__name__)


async def process_question(
    username: str,
    source: str,
    dashboard_context: dict | None,
    question: str,
) -> dict:
    """
    Process a chat question by routing to dashboard context or MCP.

    Exact port of processQuestion() from chat.service.js.

    Args:
        username: GitHub username.
        source: "dashboard" or "mcp".
        dashboard_context: Dashboard analysis data (for dashboard source).
        question: The user's question.

    Returns:
        Dict with 'source' and 'answer'.
    """
    logger.info("\n========== AI ROUTER ==========\n")
    logger.info("Question : %s", question)
    logger.info("Username : %s", username)

    if source == "dashboard":
        logger.info("Source   : DASHBOARD CONTEXT")
    else:
        logger.info("Source   : MCP")

    logger.info("\n===============================\n")

    try:
        if not question or not question.strip():
            raise ValueError("Question is required.")

        # DASHBOARD CONTEXT
        if source == "dashboard":
            answer = await generate_answer(
                question=question,
                data=dashboard_context or {},
            )

            return {
                "source": "dashboard",
                "answer": answer,
            }

        # MCP FLOW
        tool_config = None

        try:
            tool_config = await select_tool_with_gemini(question, username)

            logger.info("\n========== MCP TOOL ==========\n")
            logger.info("Tool : %s", tool_config.get("tool"))
            logger.info("Args : %s", str(tool_config.get("args", {})))
            logger.info("\n==============================\n")

        except Exception as error:
            answer = await generate_error_answer(
                question=question,
                error=str(error) or "Unable to determine which tool should handle this request.",
            )

            return {
                "source": "mcp",
                "answer": answer,
            }

        if not tool_config or not tool_config.get("tool"):
            answer = await generate_error_answer(
                question=question,
                error="No suitable tool was found for this request.",
            )

            return {
                "source": "mcp",
                "answer": answer,
            }

        try:
            mcp_result = await execute_mcp_tool(
                tool_config["tool"],
                tool_config.get("args", {}),
            )

            answer = await generate_answer(
                question=question,
                data=mcp_result,
            )

            return {
                "source": "mcp",
                "answer": answer,
            }

        except Exception as error:
            answer = await generate_error_answer(
                question=question,
                error=str(error) or "Unable to process the request with the selected tool.",
            )

            return {
                "source": "mcp",
                "answer": answer,
            }

    except Exception as error:
        return {
            "source": source or "unknown",
            "answer": str(error) or "Something went wrong while processing your request.",
        }
