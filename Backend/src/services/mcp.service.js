const axios = require("axios");

const parseMcpResponse = (rawResponse) => {
  try {
    if (typeof rawResponse === "object") {
      return rawResponse;
    }

    const jsonText = rawResponse
      .replace("event: message", "")
      .replace("data:", "")
      .trim();

    return JSON.parse(jsonText);
  } catch (error) {
    return {
      error: true,
      message: error.message,
      raw: rawResponse,
    };
  }
};

const executeMcpTool = async (toolName, args = {}) => {
  try {
    const response = await axios.post(
      "https://api.githubcopilot.com/mcp/",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_MCP_PAT}`,
          "Content-Type": "application/json",
        },
      },
    );

    const parsedResponse = parseMcpResponse(response.data);

    return parsedResponse;
  } catch (error) {
    const errorResponse = {
      error: true,
      message: error.response?.data || error.message || "Unknown MCP Error",
    };

    console.log("\n========== MCP ERROR ==========\n");
    console.log(JSON.stringify(errorResponse, null, 2));
    console.log("\n===============================\n");

    return errorResponse;
  }
};

const getAvailableTools = async () => {
  try {
    const response = await axios.post(
      "https://api.githubcopilot.com/mcp/",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_MCP_PAT}`,
          "Content-Type": "application/json",
        },
      },
    );

    const parsedResponse = parseMcpResponse(response.data);

    console.log("\n========== TOOLS RESPONSE ==========\n");

    console.log(`Loaded ${parsedResponse?.result?.tools?.length || 0} tools`);

    console.log("\n====================================\n");

    return parsedResponse;
  } catch (error) {
    console.log("\n========== TOOLS ERROR ==========\n");

    console.log(error.response?.data || error.message);

    console.log("\n=================================\n");

    return null;
  }
};

module.exports = {
  executeMcpTool,
  getAvailableTools,
};
