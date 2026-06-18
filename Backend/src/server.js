require("dotenv").config();

const app = require("./app");

const { getAvailableTools } = require("./services/mcp.service");
const { setToolsCache } = require("./mcp/mcpToolsCache");

const PORT = Number(process.env.PORT) || 5000;

const initializeMcpTools = async () => {
  try {
    console.log("\n🔄 Loading MCP Tools...\n");

    const toolsResponse = await getAvailableTools();

    const tools = toolsResponse?.result?.tools;

    if (!Array.isArray(tools) || tools.length === 0) {
      console.warn("⚠️ No MCP tools found.");
      return;
    }

    const toolList = tools.map((tool) => ({
      name: tool?.name || "",
      description: tool?.description || "",
      inputSchema: tool?.inputSchema || {},
    }));

    setToolsCache(toolList);

    console.log(`✅ Loaded ${toolList.length} MCP tools`);
  } catch (error) {
    console.error("❌ MCP Initialization Error:");
    console.error(error?.message || error);
  }
};

const startServer = async () => {
  try {
    await initializeMcpTools();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      console.error("Server Error:", error?.message || error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:");
    console.error(error?.message || error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:");
  console.error(error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:");
  console.error(error);
  process.exit(1);
});

startServer();
