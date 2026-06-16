const { executeMcpTool } = require("./mcp.service");

const { selectToolWithGemini } = require("./gemini.service");

const { generateAnswer } = require("./answerGeneration.service");

const processQuestion = async ({ source, dashboardContext, question }) => {
  /*
   * DASHBOARD
   */

  if (source === "dashboard") {
    const answer = await generateAnswer({
      question,
      data: dashboardContext,
    });

    return {
      source: "dashboard",
      answer,
    };
  }

  /*
   * MCP
   */

  const toolConfig = await selectToolWithGemini(question);

  const mcpResult = await executeMcpTool(toolConfig.tool, toolConfig.args);

  const answer = await generateAnswer({
    question,
    data: mcpResult,
  });

  return {
    source: "mcp",
    tool: toolConfig.tool,
    answer,
  };
};

module.exports = {
  processQuestion,
};
