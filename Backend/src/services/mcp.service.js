const axios = require("axios");

const MCP_URL = "https://api.githubcopilot.com/mcp/";

const mcpClient = axios.create({
  baseURL: MCP_URL,
  timeout: 30000,
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_MCP_PAT}`,
    "Content-Type": "application/json",
  },
});

const parseMcpResponse = (rawResponse) => {
  try {
    if (!rawResponse) {
      throw new Error("Empty MCP response");
    }

    if (typeof rawResponse === "object") {
      return rawResponse;
    }

    const jsonText = rawResponse
      .replace("event: message", "")
      .replace("data:", "")
      .trim();

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("MCP Response Parse Error:", error.message);

    return {
      error: true,
      message: "Unable to parse MCP response.",
      raw: rawResponse,
    };
  }
};

const executeMcpTool = async (
  toolName,
  args = {},
) => {
  try {
    if (!process.env.GITHUB_MCP_PAT) {
      throw new Error(
        "GITHUB_MCP_PAT is missing.",
      );
    }

    const response = await mcpClient.post("", {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    });

    const parsedResponse = parseMcpResponse(
      response.data,
    );

    if (parsedResponse?.error) {
      throw new Error(
        parsedResponse.message ||
          "Tool execution failed.",
      );
    }

    return parsedResponse;
  } catch (error) {
    console.error("\n========== MCP ERROR ==========\n");

    console.error(
      error.response?.data || error.message,
    );

    console.error(
      "\n===============================\n",
    );

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to execute MCP tool."
    );
  }
};

const getAvailableTools = async () => {
  try {
    if (!process.env.GITHUB_MCP_PAT) {
      throw new Error(
        "GITHUB_MCP_PAT is missing."
      );
    }

    const response = await mcpClient.post("", {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
    });

    const parsedResponse = parseMcpResponse(
      response.data,
    );

    const totalTools =
      parsedResponse?.result?.tools?.length || 0;

    console.log("\n========== TOOLS RESPONSE ==========\n");

    console.log(
      `Loaded ${totalTools} tools`
    );

    console.log(
      "\n====================================\n",
    );

    return parsedResponse;
  } catch (error) {
    console.error(
      "\n========== TOOLS ERROR ==========\n",
    );

    console.error(
      error.response?.data || error.message,
    );

    console.error(
      "\n=================================\n",
    );

    return null;
  }
};

module.exports = {
  executeMcpTool,
  getAvailableTools,
};