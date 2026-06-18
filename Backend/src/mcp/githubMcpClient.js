const axios = require("axios");
require("dotenv").config();

const MCP_URL = "https://api.githubcopilot.com/mcp/";

async function test() {
  try {
    if (!process.env.GITHUB_MCP_PAT) {
      throw new Error("GITHUB_MCP_PAT is missing.");
    }

    const response = await axios.post(
      MCP_URL,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "get_me",
          arguments: {},
        },
      },
      {
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_MCP_PAT}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("\n========== TEST ERROR ==========\n");

    console.error(error.response?.data || error.message || "Unknown Error");

    console.error("\n================================\n");
  }
}

test();
