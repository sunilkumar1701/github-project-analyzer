const axios = require("axios");

const parseMcpResponse = (rawResponse) => {
  try {
    if (typeof rawResponse === "object") {
      return rawResponse;
    }

    const dataMatch = rawResponse.match(/data:\s*(\{.*\})/s);

    if (!dataMatch) {
      return {
        error: true,
        message: "Unable to extract JSON from MCP response",
        raw: rawResponse,
      };
    }

    const parsed = JSON.parse(dataMatch[1]);

    return parsed;
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
      }
    );

    const parsedResponse = parseMcpResponse(response.data);

    console.log("\n========== MCP RESPONSE ==========\n");
    console.log(JSON.stringify(parsedResponse, null, 2));
    console.log("\n==================================\n");

    return parsedResponse;
  } catch (error) {
    const errorResponse = {
      error: true,
      message:
        error.response?.data ||
        error.message ||
        "Unknown MCP Error",
    };

    console.log("\n========== MCP ERROR ==========\n");
    console.log(JSON.stringify(errorResponse, null, 2));
    console.log("\n===============================\n");

    return errorResponse;
  }
};

module.exports = {
  executeMcpTool,
};