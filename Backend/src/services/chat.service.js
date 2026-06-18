const { executeMcpTool } = require("./mcp.service");
const { selectToolWithGemini } = require("./gemini.service");
const { generateAnswer } = require("./answerGeneration.service");
const { generateErrorAnswer } = require("./errorAnswer.service");

const processQuestion = async ({
  username,
  source,
  dashboardContext,
  question,
}) => {


  console.log("\n========== AI ROUTER ==========\n");

console.log("Question :", question);
console.log("Username :", username);

if (source === "dashboard") {
  console.log("Source   : DASHBOARD CONTEXT");
} else {
  console.log("Source   : MCP");
}

console.log("\n===============================\n");
  try {
    if (!question?.trim()) {
      throw new Error("Question is required.");
    }

    /*
     * DASHBOARD CONTEXT
     */
    if (source === "dashboard") {
      const answer = await generateAnswer({
        question,
        data: dashboardContext || {},
      });

      return {
        source: "dashboard",
        answer,
      };
    }

    /*
     * MCP FLOW
     */

    let toolConfig;

    try {
      toolConfig = await selectToolWithGemini(question, username);
      console.log("\n========== MCP TOOL ==========\n");

console.log("Tool :", toolConfig.tool);

console.log(
  "Args :",
  JSON.stringify(toolConfig.args, null, 2)
);

console.log("\n==============================\n");
    } catch (error) {
      const answer = await generateErrorAnswer({
        question,
        error:
          error.message ||
          "Unable to determine which tool should handle this request.",
      });

      return {
        source: "mcp",
        answer,
      };
    }

    if (!toolConfig?.tool) {
      const answer = await generateErrorAnswer({
        question,
        error: "No suitable tool was found for this request.",
      });

      return {
        source: "mcp",
        answer,
      };
    }

    try {
      const mcpResult = await executeMcpTool(
        toolConfig.tool,
        toolConfig.args || {},
      );

      const answer = await generateAnswer({
        question,
        data: mcpResult,
      });

      return {
        source: "mcp",
        answer,
      };
    } catch (error) {
      const answer = await generateErrorAnswer({
        question,
        error:
          error.message ||
          "Unable to process the request with the selected tool.",
      });

      return {
        source: "mcp",
        answer,
      };
    }
  } catch (error) {
    return {
      source: source || "unknown",
      answer:
        error.message || "Something went wrong while processing your request.",
    };
  }
};

module.exports = {
  processQuestion,
};
