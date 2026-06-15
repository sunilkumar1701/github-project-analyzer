const axios = require("axios");
require("dotenv").config();

async function test() {
  try {
    const response = await axios.post(
      "https://api.githubcopilot.com/mcp/",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "get_me",
          arguments: {}
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_MCP_PAT}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}

test();