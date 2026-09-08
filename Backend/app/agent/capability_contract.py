from typing import Dict, List, Optional
from pydantic import BaseModel

class CapabilityContract(BaseModel):
    """
    Defines the supported dataset operations and constraints for a specific capability.
    Acts as the backend source of truth to prevent LLM hallucinations.
    """
    dataset_scope: str
    supported_scopes: List[str]
    supported_operations: List[str]
    supported_metrics: List[str]
    required_fields: List[str]
    pagination_support: bool
    native_total_support: bool
    native_sort_support: bool
    native_filter_support: bool
    preferred_mcp_tools: List[str]
    fallback_mcp_tools: List[str]
    read_only: bool
    scope_requirements: Dict[str, str]

# Predefined Capability Contracts

REPOSITORIES_CONTRACT = CapabilityContract(
    dataset_scope="GitHub Repositories",
    supported_scopes=["all_user_repositories", "specific_repository"],
    supported_operations=["count", "sum", "max", "min", "top_n", "latest_n", "sort", "filter", "select_fields"],
    supported_metrics=["stars", "forks", "language", "updated_at", "stargazers_count", "forks_count"],
    required_fields=["name", "full_name"],
    pagination_support=True,
    native_total_support=False, # depends on the endpoint, list repos doesn't give global total count natively
    native_sort_support=True,
    native_filter_support=True,
    preferred_mcp_tools=["list_repositories", "search_repositories"],
    fallback_mcp_tools=["get_repository"],
    read_only=True,
    scope_requirements={
        "all_user_repositories": "Requires fetching all pages or a high limit to guarantee aggregation completeness.",
        "specific_repository": "Requires exact match via get_repository or targeted search."
    }
)

PROFILE_CONTRACT = CapabilityContract(
    dataset_scope="GitHub User Profile",
    supported_scopes=["current_profile"],
    supported_operations=["get", "select_fields"],
    supported_metrics=["followers", "following", "location", "bio", "company", "blog"],
    required_fields=["login", "name"],
    pagination_support=False,
    native_total_support=False,
    native_sort_support=False,
    native_filter_support=False,
    preferred_mcp_tools=["get_user"],
    fallback_mcp_tools=[],
    read_only=True,
    scope_requirements={
        "current_profile": "Requires single entity retrieval."
    }
)

LANGUAGES_CONTRACT = CapabilityContract(
    dataset_scope="Repository Languages",
    supported_scopes=["all_user_repositories", "specific_repository"],
    supported_operations=["aggregate", "top_n", "sum"],
    supported_metrics=["bytes", "percentage"],
    required_fields=["language", "bytes"],
    pagination_support=False,
    native_total_support=False,
    native_sort_support=False,
    native_filter_support=False,
    preferred_mcp_tools=["analyze_languages"],
    fallback_mcp_tools=[],
    read_only=True,
    scope_requirements={
        "all_user_repositories": "Requires server-side multi-repository aggregation.",
        "specific_repository": "Requires fetching languages for the single repository."
    }
)

README_CODE_CONTRACT = CapabilityContract(
    dataset_scope="Repository Files/README",
    supported_scopes=["specific_repository"],
    supported_operations=["get", "select_fields"],
    supported_metrics=["content"],
    required_fields=["content"],
    pagination_support=False,
    native_total_support=False,
    native_sort_support=False,
    native_filter_support=False,
    preferred_mcp_tools=["get_file_contents"],
    fallback_mcp_tools=[],
    read_only=True,
    scope_requirements={
        "specific_repository": "Requires exact repository name to prevent redundant discovery."
    }
)

PULL_REQUESTS_CONTRACT = CapabilityContract(
    dataset_scope="Pull Requests",
    supported_scopes=["all_user_pull_requests", "specific_repository"],
    supported_operations=["count", "latest_n", "top_n", "sort", "filter", "select_fields"],
    supported_metrics=["created_at", "updated_at", "state"],
    required_fields=["title", "number", "state", "html_url"],
    pagination_support=True,
    native_total_support=True, # search API provides total_count
    native_sort_support=True,
    native_filter_support=True,
    preferred_mcp_tools=["search_issues"], # Issues API searches PRs natively via is:pr
    fallback_mcp_tools=["list_pull_requests"],
    read_only=True,
    scope_requirements={
        "all_user_pull_requests": "Requires search_issues with author:{username} and is:pr.",
        "specific_repository": "Requires search_issues with repo:{fullname} and is:pr."
    }
)

ISSUES_CONTRACT = CapabilityContract(
    dataset_scope="Issues",
    supported_scopes=["all_user_issues", "specific_repository"],
    supported_operations=["count", "latest_n", "top_n", "sort", "filter", "select_fields"],
    supported_metrics=["created_at", "updated_at", "state", "comments"],
    required_fields=["title", "number", "state", "html_url"],
    pagination_support=True,
    native_total_support=True,
    native_sort_support=True,
    native_filter_support=True,
    preferred_mcp_tools=["search_issues"],
    fallback_mcp_tools=["list_issues"],
    read_only=True,
    scope_requirements={
        "all_user_issues": "Requires search_issues with author:{username} and is:issue.",
        "specific_repository": "Requires search_issues with repo:{fullname} and is:issue."
    }
)

ACTIVITY_CONTRACT = CapabilityContract(
    dataset_scope="Commits and Activity",
    supported_scopes=["all_user_repositories", "specific_repository"],
    supported_operations=["count", "latest_n", "filter", "select_fields"],
    supported_metrics=["date"],
    required_fields=["sha", "commit", "author"],
    pagination_support=True,
    native_total_support=False,
    native_sort_support=True,
    native_filter_support=True,
    preferred_mcp_tools=["list_commits"],
    fallback_mcp_tools=[],
    read_only=True,
    scope_requirements={
        "all_user_repositories": "Requires multiple calls or events API (less reliable), default to limiting scope.",
        "specific_repository": "Requires repo explicitly set."
    }
)

CAPABILITY_CONTRACTS = {
    "REPOSITORIES": REPOSITORIES_CONTRACT,
    "PROFILE": PROFILE_CONTRACT,
    "LANGUAGES": LANGUAGES_CONTRACT,
    "README_CODE": README_CODE_CONTRACT,
    "PULL_REQUESTS": PULL_REQUESTS_CONTRACT,
    "ISSUES": ISSUES_CONTRACT,
    "ACTIVITY": ACTIVITY_CONTRACT
}

def validate_contract(capability: str, operation: str, metric: str, scope: str) -> None:
    """
    Validates that a requested operation and metric are supported by the capability contract.
    Raises ValueError with a structured explanation if not supported.
    """
    if not capability:
        return # Skip validation if no capability specified (e.g., initial explicit override logic)
        
    contract = CAPABILITY_CONTRACTS.get(capability)
    if not contract:
        raise ValueError(f"Unknown capability: {capability}")
        
    # Safe deterministic normalizations
    if metric == "stars": metric = "stargazers_count"
    if metric == "forks": metric = "forks_count"
        
    if operation and operation not in contract.supported_operations:
        raise ValueError(f"Operation '{operation}' is not supported for capability '{capability}'. Supported: {contract.supported_operations}")
        
    if metric and metric not in contract.supported_metrics:
        raise ValueError(f"Metric '{metric}' is not supported for capability '{capability}'. Supported: {contract.supported_metrics}")
        
    if scope and scope not in contract.supported_scopes:
        raise ValueError(f"Scope '{scope}' is not supported for capability '{capability}'. Supported: {contract.supported_scopes}")
