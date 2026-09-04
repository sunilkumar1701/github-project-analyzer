"""
Gemini service — handles AI tool selection.
Port of services/gemini.service.js.
"""

import json
import logging

from app.clients.gemini_client import generate_content
from app.mcp.tool_cache import get_tools_cache

logger = logging.getLogger(__name__)


async def select_tool_with_gemini(question: str, username: str) -> dict:
    """
    Use Gemini to select the appropriate MCP tool for a user question.

    Exact port of selectToolWithGemini() from gemini.service.js,
    including the full prompt and validation logic.

    Args:
        question: The user's question.
        username: The current GitHub username.

    Returns:
        Dict with 'tool' (name) and 'args' (dict).

    Raises:
        ValueError: On validation errors.
        RuntimeError: On Gemini errors.
    """
    try:
        if not question or not question.strip():
            raise ValueError("Question is required.")

        available_tools = get_tools_cache()

        if not available_tools:
            raise RuntimeError("No MCP tools are available.")

        prompt = f"""
You are an expert GitHub MCP Tool Router.

Available Tools:

{json.dumps(available_tools, indent=2)}

Current GitHub Username:
{username}

TASK:

Return ONLY valid JSON.

{{
  "tool": "tool_name",
  "args": {{}}
}}

IMPORTANT ROUTING RULES

1. Questions about the CURRENT USER must use profile-related tools.

Current User:
{username}

If the question contains:

- this developer
- this profile
- this user
- my profile
- my account
- my repositories
- my followers
- my stars
- my forks
- my commits

assume it refers to:

{username}

--------------------------------------------------

PROFILE QUESTIONS

Examples:

- Who am I?
- Show my profile
- Show this developer profile
- How many followers does this developer have?
- How many repositories does this developer have?
- When was this account created?
- What is this user's bio?

ALWAYS prefer:

get_me

if that tool exists.

Never use search_users for these questions.

--------------------------------------------------

REPOSITORY SEARCH QUESTIONS

Examples:

- Find Java repositories
- Search React projects
- Search repositories about AI

Use:

search_repositories

--------------------------------------------------

USER SEARCH QUESTIONS

Examples:

- Find users named John
- Search GitHub users from India
- Search developers working on React

Use:

search_users

--------------------------------------------------

ISSUES

Use issue tools only.

--------------------------------------------------

PULL REQUESTS

Use PR tools only.

--------------------------------------------------

COMMITS

Use commit tools only.

--------------------------------------------------

FILES

Use file tools only.

--------------------------------------------------

RULES

1. Prefer exact profile tools over search tools.
2. Never use search_users when asking about the current user.
3. Never invent arguments.
4. Follow inputSchema exactly.
5. Return ONLY JSON.

User Question:

{question}
"""

        raw_text = await generate_content(prompt)

        # Clean markdown code fences
        text = (
            raw_text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        if not text:
            raise RuntimeError("Gemini returned an empty response.")

        # Parse JSON
        try:
            tool_config = json.loads(text)
        except json.JSONDecodeError:
            raise RuntimeError("Gemini returned invalid JSON.")

        if not tool_config or not isinstance(tool_config, dict):
            raise RuntimeError("Invalid tool configuration.")

        if not tool_config.get("tool"):
            raise RuntimeError("No tool selected.")

        if not tool_config.get("args") or not isinstance(tool_config.get("args"), dict):
            tool_config["args"] = {}

        # Validate tool exists in cache
        selected_tool = None
        for tool in available_tools:
            if tool.get("name") == tool_config["tool"]:
                selected_tool = tool
                break

        if not selected_tool:
            raise RuntimeError(f'Tool "{tool_config["tool"]}" does not exist.')

        # Validate required args
        required_fields = selected_tool.get("inputSchema", {}).get("required", [])
        for field in required_fields:
            if tool_config["args"].get(field) is None:
                raise RuntimeError(f"Missing required field: {field}")

        return tool_config

    except Exception as error:
        logger.error("Tool Selection Error: %s", str(error))
        raise
