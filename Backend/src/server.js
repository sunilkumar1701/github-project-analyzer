require("dotenv").config();

const app = require("./app");

const { getAvailableTools } = require("./services/mcp.service");

const { setToolsCache } = require("./mcp/mcpToolsCache");

const PORT = process.env.PORT || 5000;

const initializeMcpTools = async () => {
  try {
    console.log("\nLoading MCP Tools...\n");

    const toolsResponse = await getAvailableTools();

    if (
      !toolsResponse ||
      !toolsResponse.result ||
      !toolsResponse.result.tools
    ) {
      console.log("Failed to load MCP tools");
      return;
    }

    const toolList = toolsResponse.result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description || "",
      inputSchema: tool.inputSchema || {},
    }));

    setToolsCache(toolList);
    
  } catch (error) {
    console.log("MCP Initialization Error:");
    console.log(error.message);
  }
};

const startServer = async () => {
  await initializeMcpTools();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
