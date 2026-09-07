"""
Semantic Router for the GitHub Talent Analyzer.
Determines source_mode and required capabilities without needing an extra LLM call.
"""

import re
from typing import Any
from app.agent.schemas import ConversationTurn

class Capability:
    PROFILE = "PROFILE"
    REPOSITORIES = "REPOSITORIES"
    LANGUAGES = "LANGUAGES"
    README_CODE = "README_CODE"
    PULL_REQUESTS = "PULL_REQUESTS"
    ISSUES = "ISSUES"
    ACTIVITY = "ACTIVITY"

# Maps semantic intents (keywords/regex) to specific capabilities
_INTENT_MAP = {
    Capability.PROFILE: [r"\b(profile|followers?|following|bio|account|users?|name|location|linkedin|twitter|social|website|blog|email|link)\b"],
    Capability.REPOSITORIES: [r"\b(repository|repos?|projects?|stars?|forks?|popular)\b"],
    Capability.LANGUAGES: [r"\b(tech(nolog(y|ies))?|lang(uage)?s?|programming|frameworks?|tools?|code in)\b"],
    Capability.README_CODE: [r"\b(readme|code|files?|contents?)\b"],
    Capability.PULL_REQUESTS: [r"\b(pull requests?|prs?|merges?)\b"],
    Capability.ISSUES: [r"\b(issues?|bugs?)\b"],
    Capability.ACTIVITY: [r"\b(activity|commits?|contributions?|active|streaks?)\b"],
}

# Explicit MCP overrides
_EXPLICIT_MCP_OVERRIDE = [
    r"\b(use mcp)\b",
    r"\b(don'?t (use|look at) (the )?dashboard)\b",
    r"\b(check github)\b",
    r"\b(search (my )?repos(itories)?)\b",
    r"\b(get this from github)\b",
]

def determine_source_and_capabilities(
    question: str, 
    dashboard_data: dict[str, Any] | None, 
    history: list[ConversationTurn] | None
) -> tuple[str, list[str]]:
    """
    Returns (source_mode, capabilities)
    source_mode in ["dashboard", "mcp", "hybrid"]
    capabilities is a list of Capability strings.
    """
    question_lower = question.lower()
    
    # 1. Check Explicit Overrides
    explicit_mcp = any(re.search(pattern, question_lower) for pattern in _EXPLICIT_MCP_OVERRIDE)
    
    # 2. Determine Required Capabilities semantically
    required_caps = set()
    for cap, patterns in _INTENT_MAP.items():
        if any(re.search(pattern, question_lower) for pattern in patterns):
            required_caps.add(cap)
            
    # Check history if it's a short follow-up (e.g. "yes in the readme")
    if history and len(question.split()) < 10:
        prev_q = history[-2].content.lower() if len(history) >= 2 else ""
        if required_caps == {Capability.README_CODE}: # If only readme is triggered, inherit previous caps
             for cap, patterns in _INTENT_MAP.items():
                if any(re.search(pattern, prev_q) for pattern in patterns):
                    required_caps.add(cap)

    # 3. Determine if dashboard can satisfy these capabilities
    dashboard_can_satisfy = False
    mcp_required = False
    
    # Define what dashboard contains
    dash_keys = dashboard_data.keys() if dashboard_data else []
    has_score = "developerScore" in dash_keys or "score" in question_lower
    has_languages = "technologyStack" in dash_keys or "languages" in dash_keys
    has_repos = "repositoryAnalysis" in dash_keys
    
    # Default to dashboard if asking about score
    if "score" in question_lower or "rank" in question_lower:
        dashboard_can_satisfy = True

    for cap in required_caps:
        if cap == Capability.PROFILE and "profileAnalysis" in dash_keys:
            dashboard_can_satisfy = True
        elif cap == Capability.LANGUAGES and has_languages:
            dashboard_can_satisfy = True
        elif cap == Capability.LANGUAGES and not has_languages:
            mcp_required = True
        elif cap == Capability.REPOSITORIES:
            # If asking for most stars/latest, and dashboard has it, great. But usually we need MCP.
            # Let's say if asking for "most starred" and it's in dashboard, dashboard can satisfy.
            if "most starred" in question_lower and "mostStarredRepository" in dash_keys:
                dashboard_can_satisfy = True
            else:
                mcp_required = True
        elif cap in [Capability.PULL_REQUESTS, Capability.ISSUES, Capability.README_CODE, Capability.ACTIVITY]:
            mcp_required = True
            
    # Resolve Source Mode
    if explicit_mcp:
        source_mode = "mcp"
        if not required_caps:
             # Default to general capabilities if none detected but MCP forced
             required_caps = {Capability.REPOSITORIES, Capability.PROFILE}
    elif mcp_required and dashboard_can_satisfy:
        source_mode = "hybrid"
    elif mcp_required:
        source_mode = "mcp"
    elif dashboard_can_satisfy:
        source_mode = "dashboard"
    else:
        # Fallback
        source_mode = "dashboard"
        
    if source_mode == "dashboard":
        required_caps.clear()
        
    return source_mode, list(required_caps)
