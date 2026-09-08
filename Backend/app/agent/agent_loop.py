"""
Agent loop — the core agentic execution engine.

Implements a true iterative agent loop:
  1. Build context
  2. Call GPT-OSS 120B via Groq
  3. If no tool calls → stream final answer
  4. If tool calls → execute via FastAPI → loop
  5. MAX_AGENT_STEPS = 8 (safety cap, not a question limit)

Emits SSE events:
  - agent_started
  - tool_started
  - tool_completed
  - message_delta
  - source
  - message_completed
  - error

Security:
  - GROQ_API_KEY never leaves FastAPI
  - GITHUB_MCP_PAT never goes to the LLM
  - Tool results are normalized before being fed back
"""

import asyncio
import json
import logging
from typing import Any, AsyncGenerator

from groq import RateLimitError, APIConnectionError, APIStatusError

from app.clients.groq_client import get_groq_client, handle_groq_error
from app.agent.prompt_builder import build_messages
from app.agent.tool_registry import get_groq_tool_definitions, has_tools, get_tool
from app.agent.tool_executor import execute_tool
from app.agent.response_builder import build_sources
from app.agent.schemas import ConversationTurn
from app.core.config import get_settings

logger = logging.getLogger(__name__)

MAX_AGENT_STEPS = 8

# Token budget targets
SAFE_INPUT_TOKEN_TARGET = 6500
HARD_CONTEXT_GUARD = 7000

def _sse(event: dict) -> str:
    """Format a dict as an SSE data line."""
    return f"data: {json.dumps(event)}\n\n"


def _compact_old_tool_result(content_str: str) -> str:
    """
    Semantic Fact Extractor.
    Extracts identifiers and scalar facts from previous tool results to preserve state,
    while dropping bloated lists and strings to prevent context explosion.
    """
    if len(content_str) < 200:
        return content_str # Already small enough
        
    try:
        data = json.loads(content_str)
        if isinstance(data, dict):
            # If it's a paginated wrapper like {"items": [...]}, just keep the top-level scalars
            compact = {}
            for k, v in data.items():
                if isinstance(v, (str, int, float, bool)):
                    if isinstance(v, str) and len(v) > 200:
                        continue # drop huge strings (descriptions/readme)
                    compact[k] = v
                elif isinstance(v, list) and k in ["items", "results"]:
                    # Keep a tiny representation of all items for continuity
                    summary_list = []
                    for item in v:
                        if isinstance(item, dict):
                            rep = {ik: iv for ik, iv in item.items() if ik in ["name", "full_name", "number", "state", "sha", "stars", "stargazers_count"]}
                            if rep:
                                summary_list.append(rep)
                    if summary_list:
                        compact[f"{k}_summary"] = summary_list
            
            # If nothing was extracted, keep at least the keys to show what was there
            if not compact:
                compact["note"] = f"List containing keys: {list(data.keys())}"
                
            return json.dumps(compact)
            
        elif isinstance(data, list):
             # If direct list, keep summaries of all items
             summary_list = []
             for item in data:
                  if isinstance(item, dict):
                       rep = {ik: iv for ik, iv in item.items() if ik in ["name", "full_name", "number", "state", "sha", "stars", "stargazers_count"]}
                       if rep:
                           summary_list.append(rep)
             if summary_list:
                  return json.dumps({"note": "Truncated list summaries", "items_summary": summary_list})
             return json.dumps({"note": f"List of {len(data)} items"})
             
    except Exception:
        pass
        
    return '{"note": "[Prior step result compressed to save tokens]"}'


async def run_agent(
    username: str,
    question: str,
    dashboard_data: dict[str, Any] | None,
    history: list[ConversationTurn] | None,
    summary: str | None,
) -> AsyncGenerator[str, None]:
    """
    Run the agentic loop and yield SSE events.

    Args:
        username: GitHub username being analyzed.
        question: Current user message.
        dashboard_data: Dashboard analysis data.
        history: Recent conversation history.
        summary: Optional summary of older conversation.

    Yields:
        SSE-formatted strings.
    """
    settings = get_settings()
    client = get_groq_client()

    yield _sse({"type": "agent_started"})

    # Build initial messages and get routing context
    messages, source_mode, capabilities = build_messages(
        username=username,
        question=question,
        dashboard_data=dashboard_data,
        history=history,
        summary=summary,
    )

    # Tool definitions (only if tools available AND permitted by source_mode)
    tools = get_groq_tool_definitions() if (has_tools() and source_mode in ["mcp", "hybrid"]) else []

    # Token estimation and [CHAT BUDGET] breakdown
    sys_tokens = len(messages[0].get("content", "")) // 4 if messages else 0
    dash_tokens = len(messages[1].get("content", "")) // 4 if len(messages) > 1 and "Dashboard data" in messages[1].get("content", "") else 0
    hist_tokens = sum(len(m.get("content", "")) // 4 for m in messages[2:-1]) if len(messages) > 2 else 0
    tools_schema_tokens = len(json.dumps(tools)) // 4 if tools else 0
    
    est_tokens = len(json.dumps(messages)) // 4 + tools_schema_tokens

    # Progressive Context Reduction
    if est_tokens > SAFE_INPUT_TOKEN_TARGET:
        logger.warning("Token budget exceeded SAFE limit (%d > %d). Progressively reducing...", est_tokens, SAFE_INPUT_TOKEN_TARGET)
        # 1. Drop conversation history
        messages = [m for m in messages if m["role"] == "system" or "Dashboard data" in m.get("content", "") or m == messages[-1]]
        est_tokens = len(json.dumps(messages)) // 4 + tools_schema_tokens
        
        # 2. If still too large, drop dashboard context
        if est_tokens > SAFE_INPUT_TOKEN_TARGET:
             messages = [m for m in messages if m["role"] == "system" or m == messages[-1]]
             est_tokens = len(json.dumps(messages)) // 4 + tools_schema_tokens

    if est_tokens > HARD_CONTEXT_GUARD:
        logger.error("Token budget exceeded HARD limit: %d > %d", est_tokens, HARD_CONTEXT_GUARD)
        yield _sse({"type": "error", "message": "The required context is too large. Please ask a more specific question or clear your chat history."})
        return

    logger.info(
        "\n[CHAT BUDGET]\n"
        "step=1\n"
        "source_mode=%s\n"
        "capabilities=%d\n"
        "estimated_input_tokens=%d\n"
        "dashboard_tokens=%d\n"
        "history_tokens=%d\n"
        "tool_schema_tokens=%d\n"
        "tools_exposed=%d\n",
        source_mode, len(capabilities), est_tokens, dash_tokens, hist_tokens, tools_schema_tokens, 1 if tools else 0
    )

    tool_results: list[dict] = []
    executed_tool_signatures: set[str] = set()
    step = 0

    try:
        while step < MAX_AGENT_STEPS:
            step += 1
            logger.info("Agent step %d/%d", step, MAX_AGENT_STEPS)

            # Multi-step context compression: compress tool results from older steps
            if step > 1:
                for idx, m in enumerate(messages):
                    if m["role"] == "tool":
                        # Only keep the full result for the most recent step's tools
                        # We approximate "most recent" by checking if it's near the end
                        if idx < len(messages) - 3:
                            m["content"] = _compact_old_tool_result(m.get("content", ""))

            try:
                # Non-streaming call to get tool calls; streaming for final answer
                # We use non-streaming for tool-call steps (need complete response)
                # and streaming only for the final text response.
                kwargs = {
                    "model": settings.GROQ_MODEL,
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 1024,
                    "stream": False,
                }
                if tools:
                    kwargs["tools"] = tools
                    kwargs["tool_choice"] = "auto"
                    
                response = await client.chat.completions.create(**kwargs)

            except RateLimitError as e:
                logger.warning("Groq rate limit: %s", str(e))
                yield _sse({"type": "error", "message": handle_groq_error(e)})
                return
            except (APIConnectionError, APIStatusError) as e:
                logger.error("Groq API error: %s", str(e))
                yield _sse({"type": "error", "message": handle_groq_error(e)})
                return
            except asyncio.CancelledError:
                logger.info("Agent cancelled by client disconnect")
                return
            except Exception as e:
                logger.error("Groq unexpected error: %s", str(e))
                yield _sse({"type": "error", "message": "Couldn't complete that request. Please try again."})
                return

            choice = response.choices[0] if response.choices else None
            if not choice:
                yield _sse({"type": "error", "message": "No response from AI service."})
                return

            message = choice.message

            # Check for tool calls
            tool_calls = message.tool_calls or []

            if not tool_calls:
                # No tool calls — stream the final answer
                final_content = message.content or ""

                # Log token usage
                if response.usage:
                    actual_in = response.usage.prompt_tokens
                    actual_out = response.usage.completion_tokens
                    logger.info(
                        "\n[CHAT BUDGET]\n"
                        "step=%d\n"
                        "actual_input_tokens=%d\n"
                        "output_tokens=%d\n"
                        "tools_called=%d\n",
                        step, actual_in, actual_out, len(tool_results)
                    )

                # Stream the final answer character by character
                # (simulate streaming since we used non-streaming)
                chunk_size = 4  # emit in small chunks
                for i in range(0, len(final_content), chunk_size):
                    chunk = final_content[i:i + chunk_size]
                    yield _sse({"type": "message_delta", "content": chunk})
                    await asyncio.sleep(0)  # yield control

                # Emit sources if tools were used
                if tool_results:
                    sources = build_sources(tool_results)
                    if sources:
                        yield _sse({"type": "source", "sources": sources})

                yield _sse({"type": "message_completed"})
                return

            # Tool calls present — execute them
            # Append assistant message with tool calls to conversation
            assistant_msg: dict[str, Any] = {
                "role": "assistant",
                "content": message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in tool_calls
                ],
            }
            messages.append(assistant_msg)

            # Execute each tool call
            for tc in tool_calls:
                call_name = tc.function.name
                
                # Parse arguments
                try:
                    call_args = json.loads(tc.function.arguments or "{}")
                except json.JSONDecodeError:
                    call_args = {}

                # Handle gateway tool unpacking
                reduction = None
                if call_name == "github_mcp":
                    tool_name = call_args.get("tool_name", "")
                    args = call_args.get("arguments", {})
                    reduction = call_args.get("reduction")
                else:
                    tool_name = call_name
                    args = call_args

                tool_def = get_tool(tool_name)
                ui_label = tool_def["ui_label"] if tool_def else f"Consulting GitHub ({tool_name})"

                # 1. Duplicate/Loop Prevention
                signature = f"{tool_name}:{json.dumps(args, sort_keys=True)}:{json.dumps(reduction, sort_keys=True)}"
                if signature in executed_tool_signatures:
                    logger.warning("Duplicate tool call prevented: %s", signature)
                    result = {
                        "success": False,
                        "tool_name": tool_name,
                        "result": None,
                        "error": "DUPLICATE_CALL: You already executed this exact tool call in this request. Please review your previous tool results instead of repeating the call. If you need different data, change the arguments or reduction plan.",
                    }
                else:
                    executed_tool_signatures.add(signature)
                    yield _sse({
                        "type": "tool_started",
                        "tool": tool_name,
                        "label": ui_label,
                    })

                    # Execute via FastAPI tool executor (never direct from LLM)
                    result = await execute_tool(tool_name, args, reduction)
                    tool_results.append(result)

                    yield _sse({
                        "type": "tool_completed",
                        "tool": tool_name,
                        "success": result["success"],
                    })

                # Append tool result to messages
                tool_result_content = (
                    json.dumps(result["result"], default=str)
                    if result["success"] and result["result"] is not None
                    else result.get("error", "Tool execution failed.")
                )

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": tool_result_content,
                })

            # 2. Tool-Wandering Prevention
            if len(executed_tool_signatures) >= 4:
                messages.append({
                    "role": "system",
                    "content": "WANDERING_PREVENTION: You have made several tool calls. Please synthesize the accumulated data to answer the user now. Do not call additional tools unless absolutely required to fulfill a specific unresolved element of your QueryPlan."
                })

        # If we reach here, we hit MAX_AGENT_STEPS
        logger.warning("Agent reached MAX_AGENT_STEPS (%d)", MAX_AGENT_STEPS)
        yield _sse({
            "type": "message_delta",
            "content": "I've analyzed the available information. Based on what I found, please check your dashboard for the most up-to-date details, or try rephrasing your question for a more focused answer.",
        })
        if tool_results:
            sources = build_sources(tool_results)
            if sources:
                yield _sse({"type": "source", "sources": sources})
        yield _sse({"type": "message_completed"})

    except asyncio.CancelledError:
        logger.info("Agent generator cancelled")
        return
    except Exception as e:
        logger.error("Agent loop unexpected error: %s", str(e), exc_info=True)
        yield _sse({"type": "error", "message": "Something went wrong. Please try again."})
