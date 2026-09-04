"""
Answer generation service.
Port of services/answerGeneration.service.js and services/errorAnswer.service.js.
"""

import json
import logging

from app.clients.gemini_client import generate_content

logger = logging.getLogger(__name__)


async def generate_answer(question: str, data: dict | list | None = None) -> str:
    """
    Generate a human-readable answer using Gemini.

    Exact port of generateAnswer() from answerGeneration.service.js,
    including the full prompt.

    Args:
        question: The user's question.
        data: The data context (MCP result or dashboard context).

    Returns:
        Formatted answer string.
    """
    try:
        if not question or not question.strip():
            raise ValueError("Question is required.")

        prompt = f"""
You are an expert GitHub Analyst AI.

User Question:
{question}

Available Data:
{json.dumps(data, indent=2, default=str)}

Instructions:

1. Answer the user's question directly.
2. Never mention JSON, APIs, tool results, MCP, or internal systems.
3. Extract only relevant information.
4. Use markdown formatting.
5. Use bullet points when appropriate.
6. Keep answers concise, professional, and easy to understand.
7. If multiple repositories or users are returned, show only the top 5 most relevant.
8. If no information is available, politely state that no results were found.
9. Never hallucinate information.
10. Do not fabricate statistics, repositories, or usernames.
11. Use tables only when helpful.
12. Return ONLY the final answer.
"""

        answer = await generate_content(prompt)
        answer = answer.strip() if answer else ""

        if not answer:
            return "I couldn't generate a response for this request."

        return answer

    except Exception as error:
        logger.error("Answer Generation Error: %s", str(error))
        return str(error) or "Unable to generate a response at the moment."


async def generate_error_answer(question: str, error: str) -> str:
    """
    Generate a user-friendly error response using Gemini.

    Exact port of generateErrorAnswer() from errorAnswer.service.js,
    including the full prompt.

    Args:
        question: The user's original question.
        error: The error message to explain.

    Returns:
        Formatted error answer string.
    """
    try:
        prompt = f"""
You are a professional GitHub AI Assistant.

User Question:
"{question}"

Problem:
"{error}"

Instructions:

1. Explain the issue in simple language.
2. Never mention internal errors, stack traces, JSON, APIs, Gemini, MCP, or implementation details.
3. Be polite and professional.
4. Explain what you are unable to do.
5. Suggest what the assistant can help with instead.
6. Use markdown formatting.
7. Use bullet points when appropriate.
8. Return ONLY the final answer.

Example:

❌ I currently cannot generate PDF files.

However, I can help you with:

- Repository analysis
- Pull requests
- Issues
- User profiles
- Organizations
"""

        answer = await generate_content(prompt)
        answer = answer.strip() if answer else ""

        if not answer:
            return _default_error_message()

        return answer

    except Exception as err:
        logger.error("Error Answer Generation Failed: %s", str(err))
        return _default_error_message()


def _default_error_message() -> str:
    """Default fallback error message. Exact port from errorAnswer.service.js."""
    return """
❌ I couldn't complete this request.

However, I can still help you with:

- Repository analysis
- User profiles
- Repository statistics
- Pull requests
- Issues
- Organizations

Please try another GitHub-related question.
""".strip()
