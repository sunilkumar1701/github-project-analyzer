"""
FastAPI application entry point.
Port of app.js + server.js.

Start with:
    uvicorn app.main:app --reload --port 5000
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.middleware.error_handler import register_exception_handlers
from app.middleware.logging import setup_logging

from app.clients.github_client import init_github_client, close_github_client
from app.clients.gemini_client import init_gemini_client
from app.clients.mcp_client import init_mcp_client, close_mcp_client

from app.services.mcp_service import get_available_tools
from app.mcp.tool_cache import set_tools_cache

from app.api.routes.github import router as github_router
from app.api.routes.developer_score import router as developer_score_router
from app.api.routes.chat import router as chat_router

# Setup logging first
setup_logging()

logger = logging.getLogger(__name__)


async def initialize_mcp_tools() -> None:
    """
    Load MCP tools at startup and cache them.
    Port of initializeMcpTools() from server.js.
    """
    try:
        logger.info("\n🔄 Loading MCP Tools...\n")

        tools_response = await get_available_tools()

        tools = None
        if tools_response and isinstance(tools_response, dict):
            result = tools_response.get("result", {})
            if isinstance(result, dict):
                tools = result.get("tools")

        if not isinstance(tools, list) or len(tools) == 0:
            logger.warning("⚠️ No MCP tools found.")
            return

        tool_list = [
            {
                "name": tool.get("name", ""),
                "description": tool.get("description", ""),
                "inputSchema": tool.get("inputSchema", {}),
            }
            for tool in tools
        ]

        set_tools_cache(tool_list)

        logger.info("✅ Loaded %d MCP tools", len(tool_list))

    except Exception as error:
        logger.error("❌ MCP Initialization Error:")
        logger.error(str(error))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan — runs on startup and shutdown.
    Replaces the startServer() function from server.js.
    """
    # Startup
    logger.info("Starting GitHub Talent Analyzer Backend...")

    await init_github_client()
    init_gemini_client()
    await init_mcp_client()
    await initialize_mcp_tools()

    logger.info("🚀 GitHub Talent Analyzer Backend Ready")

    yield

    # Shutdown
    logger.info("Shutting down...")
    await close_github_client()
    await close_mcp_client()
    logger.info("Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="GitHub Talent Analyzer",
    description="AI-powered GitHub developer profile analysis backend",
    version="2.0.0",
    lifespan=lifespan,
)


# CORS — mirrors the Express cors({ origin: true, credentials: true })
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register exception handlers
register_exception_handlers(app)


# Health check — mirrors app.get("/")
@app.get("/")
async def health_check():
    return {
        "success": True,
        "message": "GitHub Talent Analyzer Backend Running 🚀",
    }


# Mount routes — mirrors app.use("/api/github", ...) etc.
app.include_router(github_router, prefix="/api/github")
app.include_router(developer_score_router, prefix="/api/github/developer-score")
app.include_router(chat_router, prefix="/api/chat")
