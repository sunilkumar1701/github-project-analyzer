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
    """Apply deterministic data reduction to a result list based on the gateway arguments."""
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

    # 1. Filter
    filter_key = reduction.get("filter_key")
    filter_val = reduction.get("filter_value")
    if filter_key and filter_val:
        data = [item for item in data if isinstance(item, dict) and str(item.get(filter_key, "")).lower() == str(filter_val).lower()]

    # 2. Sort / Top N
    if op in ["top_n", "latest_n"]:
        n = int(reduction.get("n", 5))
        field = reduction.get("field", "stargazers_count" if op == "top_n" else "updated_at")
        
        # Sort data
        try:
            data.sort(key=lambda x: x.get(field, 0) if isinstance(x, dict) and x.get(field) is not None else 0, reverse=True)
        except Exception:
            pass # fallback to unsorted if field types are incomparable
            
        return {"items": data[:n]}

    # 3. Count
    if op == "count":
        return {
            "local_count": len(data),
            "note": "This is the count of the provided subset. It may not reflect global counts if pagination occurred."
        }

    # 4. Select Fields
    if op == "select_fields":
        n = int(reduction.get("n", 5))
        field_str = reduction.get("field", "")
        fields = [f.strip() for f in field_str.split(",") if f.strip()]
        
        if fields:
            reduced = []
            for item in data[:n]:
                if isinstance(item, dict):
                    reduced.append({k: v for k, v in item.items() if k in fields})
                else:
                    reduced.append(item)
            return {"items": reduced}
        return {"items": data[:n]}

    return data


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

async def _analyze_languages_pipeline(arguments: dict[str, Any]) -> dict[str, Any]:
    """Deterministically aggregate languages across all repos for a user."""
    owner = arguments.get("owner")
    if not owner:
        raise ValueError("Missing 'owner' argument for language analysis.")
        
    # Fetch repos
    repos_data = await _execute_mcp_direct("list_repositories", {"owner": owner, "sort": "pushed"})
    
    if isinstance(repos_data, dict) and "items" in repos_data:
        repos = repos_data["items"]
    elif isinstance(repos_data, list):
        repos = repos_data
    else:
        repos = []

    lang_totals = {}
    for repo in repos[:15]: # Limit to top 15 most active to respect rate limits
        if not repo.get("name"):
            continue
        try:
            lang_data = await _execute_mcp_direct("get_repository", {"owner": owner, "repo": repo["name"]})
            # In real GitHub API, get_repository might just return the primary language. 
            # We'll use the primary language and stars/forks as proxy weights if byte count isn't returned
            primary = lang_data.get("language")
            if primary:
                lang_totals[primary] = lang_totals.get(primary, 0) + 1
        except Exception:
            continue
            
    sorted_langs = [{"language": k, "repo_count": v} for k, v in sorted(lang_totals.items(), key=lambda item: item[1], reverse=True)]
    
    return {
        "analysis_type": "language_aggregation",
        "top_languages": sorted_langs,
        "note": "Aggregated from recent active repositories."
    }

async def _get_latest_pr_pipeline(arguments: dict[str, Any]) -> dict[str, Any]:
    """Deterministically find the latest PR for an author."""
    author = arguments.get("author")
    if not author:
         raise ValueError("Missing 'author' argument.")
         
    query = f"is:pr author:{author} sort:created-desc"
    try:
        data = await _execute_mcp_direct("search_issues", {"query": query}) # search_issues handles PRs natively
        
        # Apply strict reduction
        reduction = {"operation": "latest_n", "n": 1, "field": "created_at"}
        return _apply_reduction(data, reduction)
    except Exception as e:
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
    # 0. Intercept pseudo-capability pipelines
    if tool_name == "analyze_languages":
        try:
             res = await _analyze_languages_pipeline(arguments)
             return {"success": True, "tool_name": tool_name, "result": res, "error": None}
        except Exception as e:
             return {"success": False, "tool_name": tool_name, "result": None, "error": str(e)}
             
    if tool_name == "get_latest_pr":
        try:
             res = await _get_latest_pr_pipeline(arguments)
             return {"success": True, "tool_name": tool_name, "result": res, "error": None}
        except Exception as e:
             return {"success": False, "tool_name": tool_name, "result": None, "error": str(e)}

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
