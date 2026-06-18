const { executeMcpTool } = require("./mcp.service");
const { selectToolWithGemini } = require("./gemini.service");
const { generateAnswer } = require("./answerGeneration.service");

const processQuestion = async ({
  username,
  source,
  dashboardContext,
  question,
}) => {

  console.log("QUESTION:", question);
console.log("USERNAME:", username);
console.log("SOURCE:", source);

  console.log(
    source === "dashboard"
      ? "USING DASHBOARD CONTEXT"
      : "USING GITHUB MCP"
  );

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

  const toolConfig = await selectToolWithGemini(question,username);

  const mcpResult = await executeMcpTool(
    toolConfig.tool,
    toolConfig.args
  );

  const answer = await generateAnswer({
    question,
    data: mcpResult,
  });

  return {
    source: "mcp",
    answer,
  };
};

module.exports = {
  processQuestion,
};