const { executeMcpTool } = require("./mcp.service");
const { getMcpTool } = require("../utils/mcpToolMapper");

const processQuestion = async ({
  username,
  source,
  dashboardContext,
  question,
}) => {
  /*
   * DASHBOARD
   */

  if (source === "dashboard") {
    console.log("Using Dashboard Context");

    return {
      question,
      source: "dashboard",
      data: dashboardContext,
    };
  }

  /*
   * MCP
   */

  if (source === "mcp") {
    console.log("Using GitHub MCP");

    const toolConfig = getMcpTool(question);

    if (!toolConfig) {
      return {
        question,
        source: "mcp",
        data: "No MCP Tool Found",
      };
    }

    const result = await executeMcpTool(toolConfig.tool, toolConfig.args);

    return {
      question,
      source: "mcp",
      tool: toolConfig.tool,
      data: result,
    };
  }

  return {
    question,
    source: "unknown",
    data: null,
  };
};

module.exports = {
  processQuestion,
};
