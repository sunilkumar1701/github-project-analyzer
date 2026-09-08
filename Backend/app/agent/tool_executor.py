"""
Tool executor — FastAPI-owned MCP tool executor.

The LLM requests tool_name + arguments.
FastAPI validates, allow-lists, and executes.
The LLM NEVER connects directly to GitHub MCP.

Security:
- Tool must be in the allow-list
- Tool must be read-only
- Arguments validated against input_schema required fields
- MCP result normalized (remove huge irrelevant fields)
- GITHUB_MCP_PAT never sent to the LLM
"""

import json
import logging
from typing import Any

from app.agent.tool_registry import get_tool, is_tool_allowed
from app.clients.mcp_client import mcp_request
from app.services.mcp_service import parse_mcp_response
from app.agent.semantic_router import Capability
from app.agent.capability_contract import validate_contract

logger = logging.getLogger(__name__)

# Max size of a tool result (characters) to prevent massive context injection
MAX_RESULT_CHARS = 8000

# Fields to remove from MCP results to reduce token usage
_STRIP_FIELDS = {
    "node_id",
    "gravatar_id",
    "events_url",
    "followers_url",
    "following_url",
    "gists_url",
    "starred_url",
    "subscriptions_url",
    "organizations_url",
    "repos_url",
    "received_events_url",
    "type",
    "site_admin",
    "hooks_url",
    "issue_events_url",
    "notifications_url",
    "keys_url",
    "teams_url",
    "git_refs_url",
    "git_tags_url",
    "contents_url",
    "compare_url",
    "merges_url",
    "archive_url",
    "downloads_url",
    "deployments_url",
    "git_commits_url",
    "git_url",
    "mirror_url",
    "ssh_url",
    "clone_url",
    "svn_url",
    "statuses_url",
    "languages_url",
    "stargazers_url",
    "contributors_url",
    "subscribers_url",
    "subscription_url",
    "commits_url",
    "blobs_url",
    "trees_url",
    "pulls_url",
    "milestones_url",
    "assignees_url",
    "branches_url",
    "tags_url",
    "collaborators_url",
    "issue_comment_url",
    "issues_url",
    "releases_url",
    "labels_url",
    "comments_url",
}


def _normalize_obj(obj: Any, depth: int = 0) -> Any:
    """Recursively remove noisy URL template fields and aggressively normalize entities."""
    if depth > 5:
        return obj
        
    if isinstance(obj, dict):
        # Aggressive normalization for known GitHub entities
        
        # Repository heuristic
        if "stargazers_count" in obj and "full_name" in obj:
            return {
                "name": obj.get("full_name") or obj.get("name"),
                "description": obj.get("description"),
                "stars": obj.get("stargazers_count"),
                "forks": obj.get("forks_count"),
                "language": obj.get("language"),
                "updatedAt": obj.get("updated_at"),
                "url": obj.get("html_url"),
            }
            
        # Issue / PR heuristic
        if "number" in obj and "title" in obj and "state" in obj:
            return {
                "number": obj.get("number"),
                "title": obj.get("title"),
                "state": obj.get("state"),
                "createdAt": obj.get("created_at"),
                "updatedAt": obj.get("updated_at"),
                "url": obj.get("html_url"),
            }
            
        # Commit heuristic
        if "sha" in obj and "commit" in obj:
            commit_data = obj["commit"]
            return {
                "sha": obj.get("sha"),
                "message": commit_data.get("message"),
                "author": commit_data.get("author", {}).get("name"),
                "date": commit_data.get("author", {}).get("date"),
                "url": obj.get("html_url"),
            }
            
        # Fallback strip fields
        return {
            k: _normalize_obj(v, depth + 1)
            for k, v in obj.items()
            if k not in _STRIP_FIELDS
        }
        
    if isinstance(obj, list):
        return [_normalize_obj(item, depth + 1) for item in obj[:15]]  # tighter cap
        
    return obj


def _apply_reduction(data: Any, reduction: dict | None) -> Any:
    """Apply deterministic data reduction to a result list based on the QueryPlan."""
    if not isinstance(data, list):
        return data

    if not reduction:
        if len(data) > 10:
            return {
                "items": data[:10],
                "note": "Results safely truncated to 10. For full analysis, use a deterministic reduction operation (like count or top_n)."
            }
        return data

    op = reduction.get("operation")
    if not op:
        return data

    metric = reduction.get("metric")
    limit = int(reduction.get("limit", reduction.get("n", 5)))
    
    # Safe metric normalizations
    if metric == "stars": metric = "stargazers_count"
    if metric == "forks": metric = "forks_count"

    # 1. Filter
    filters = reduction.get("filters", {})
    # also support legacy filter_key/filter_value
    if "filter_key" in reduction and "filter_value" in reduction:
        filters[reduction["filter_key"]] = reduction["filter_value"]

    if filters:
        for k, v in filters.items():
            data = [item for item in data if isinstance(item, dict) and str(item.get(k, "")).lower() == str(v).lower()]

    # 2. Sort
    sort_field = reduction.get("sort")
    if sort_field:
        desc = True
        if sort_field.lower().endswith(" asc"):
            desc = False
            sort_field = sort_field[:-4]
        elif sort_field.lower().endswith(" desc"):
            sort_field = sort_field[:-5]
            
        try:
            data.sort(key=lambda x: x.get(sort_field, 0) if isinstance(x, dict) and x.get(sort_field) is not None else 0, reverse=desc)
        except Exception:
            pass

    # Generic Operations
    if op == "count":
        return {"local_count": len(data), "note": "Local count of provided subset."}
        
    if op == "sum" and metric:
        total = sum(item.get(metric, 0) for item in data if isinstance(item, dict) and isinstance(item.get(metric), (int, float)))
        return {f"total_{metric}": total}
        
    if op == "max" and metric:
        if not data: return {"max": None}
        best = max(data, key=lambda x: x.get(metric, 0) if isinstance(x, dict) and isinstance(x.get(metric), (int, float)) else -float('inf'))
        return {"max_item": best}
        
    if op == "min" and metric:
        if not data: return {"min": None}
        worst = min(data, key=lambda x: x.get(metric, 0) if isinstance(x, dict) and isinstance(x.get(metric), (int, float)) else float('inf'))
        return {"min_item": worst}

    if op in ["top_n", "latest_n"]:
        field = metric if op == "top_n" else "updated_at"
        if not sort_field: # If not already sorted
            try:
                data.sort(key=lambda x: x.get(field, 0) if isinstance(x, dict) and x.get(field) is not None else 0, reverse=True)
            except Exception:
                pass
        return {"items": data[:limit]}

    if op == "select_fields":
        field_str = metric or reduction.get("field", "")
        fields = [f.strip() for f in field_str.split(",") if f.strip()]
        if fields:
            reduced = []
            for item in data[:limit]:
                if isinstance(item, dict):
                    reduced.append({k: v for k, v in item.items() if k in fields})
                else:
                    reduced.append(item)
            return {"items": reduced}
        return {"items": data[:limit]}
        
    if op == "aggregate" and metric == "language":
        # Group by language
        lang_totals = {}
        for item in data:
            if isinstance(item, dict):
                lang = item.get("language")
                if lang:
                    lang_totals[lang] = lang_totals.get(lang, 0) + 1
        sorted_langs = [{"language": k, "count": v} for k, v in sorted(lang_totals.items(), key=lambda item: item[1], reverse=True)]
        return {"aggregated_languages": sorted_langs}

    return {"items": data[:limit]}


def _extract_content(parsed: dict, reduction: dict | None) -> Any:
    """
    Extract the actual content from an MCP response.
    GitHub MCP wraps results in result.content[].text or result.content[].
    """
    result = parsed.get("result", parsed)

    # Handle MCP content array format
    content = result.get("content") if isinstance(result, dict) else None
    if isinstance(content, list) and content:
        first = content[0]
        if isinstance(first, dict) and first.get("type") == "text":
            text = first.get("text", "")
            try:
                data = json.loads(text)
            except Exception:
                return text
                
            return _apply_reduction(data, reduction)
        return first
        
    # Handle direct result if not wrapped
    return _apply_reduction(result, reduction)

async def _execute_mcp_direct(tool_name: str, arguments: dict[str, Any], reduction: dict | None = None) -> dict[str, Any]:
    """Helper to execute a raw MCP tool directly."""
    try:
        raw = await mcp_request(
            method="tools/call",
            params={"name": tool_name, "arguments": arguments},
        )
        parsed = parse_mcp_response(raw)

        if parsed.get("error") and not parsed.get("result"):
            raise RuntimeError(parsed.get("message", "MCP tool returned an error."))

        # Normalize result
        content = _extract_content(parsed, reduction)
        return _normalize_obj(content)
    except Exception as e:
        logger.error("Raw MCP execution error (%s): %s", tool_name, str(e))
        raise

async def execute_tool(tool_name: str, arguments: dict[str, Any], reduction: dict | None = None) -> dict[str, Any]:
    """
    Execute an MCP tool by name with the given arguments.

    Security:
    1. Verify tool is in allow-list
    2. Verify tool is read-only
    3. Validate required arguments
    4. Execute MCP request
    5. Normalize and truncate result

    Returns:
        {
            "success": True/False,
            "tool_name": str,
            "result": ...,
            "error": str | None,
        }
    """
    # 0. Contract Enforcement
    if reduction:
        cap = reduction.get("capability")
        op = reduction.get("operation")
        metric = reduction.get("metric")
        scope = reduction.get("scope")
        try:
            validate_contract(cap, op, metric, scope)
            # Safe deterministic normalization
            if metric == "stars": reduction["metric"] = "stargazers_count"
            if metric == "forks": reduction["metric"] = "forks_count"
        except ValueError as e:
            return {
                "success": False,
                "tool_name": tool_name,
                "result": None,
                "error": str(e)
            }

    # 1. Check allow-list for raw tools
    if not is_tool_allowed(tool_name):
        logger.warning("Tool not in allow-list: %s", tool_name)
        return {
            "success": False,
            "tool_name": tool_name,
            "result": None,
            "error": f"Tool '{tool_name}' is not available. Please use a valid capability/tool.",
        }

    tool_def = get_tool(tool_name)
    if not tool_def:
        return {
            "success": False,
            "tool_name": tool_name,
            "result": None,
            "error": f"Tool '{tool_name}' definition not found.",
        }

    # 2. Read-only check (belt-and-suspenders)
    if not tool_def.get("readonly", True):
        logger.error("Attempted non-readonly tool execution: %s", tool_name)
        return {
            "success": False,
            "tool_name": tool_name,
            "result": None,
            "error": "This tool is not permitted (write operations are disabled).",
        }

    # 3. Validate required args
    schema = tool_def.get("input_schema", {})
    required = schema.get("required", [])
    for field in required:
        if field not in arguments or arguments[field] is None:
            return {
                "success": False,
                "tool_name": tool_name,
                "result": None,
                "error": f"Missing required argument: {field}",
            }

    # 4. Execute MCP
    try:
        logger.info("Executing MCP tool: %s args=%s", tool_name, list(arguments.keys()))
        raw = await mcp_request(
            method="tools/call",
            params={"name": tool_name, "arguments": arguments},
        )
        parsed = parse_mcp_response(raw)

        if parsed.get("error") and not parsed.get("result"):
            raise RuntimeError(parsed.get("message", "MCP tool returned an error."))

        # 5. Normalize result
        content = _extract_content(parsed, reduction)
        normalized = _normalize_obj(content)

        # Truncate if too large
        result_str = json.dumps(normalized, default=str)
        if len(result_str) > MAX_RESULT_CHARS:
            logger.warning(
                "Tool result for %s truncated (%d -> %d chars)",
                tool_name, len(result_str), MAX_RESULT_CHARS,
            )
            result_str = result_str[:MAX_RESULT_CHARS] + "... [result truncated]"
            normalized = result_str

        return {
            "success": True,
            "tool_name": tool_name,
            "result": normalized,
            "error": None,
        }

    except Exception as e:
        logger.error("Tool execution error (%s): %s", tool_name, str(e))
        return {
            "success": False,
            "tool_name": tool_name,
            "result": None,
            "error": f"GitHub could not be reached for '{tool_name}'. Please try again.",
        }
