const ai = require("../config/gemini");

const { getToolsCache } = require("../mcp/mcpToolsCache");

const selectToolWithGemini = async (question, username) => {


  const availableTools = getToolsCache();

 const prompt = `
You are an expert GitHub MCP Tool Router.

Available Tools:

${JSON.stringify(availableTools, null, 2)}

Current GitHub Username:
${username}

TASK:

Return ONLY valid JSON.

{
  "tool": "tool_name",
  "args": {}
}

IMPORTANT ROUTING RULES

1. Questions about the CURRENT USER must use profile-related tools.

Current User:
${username}

If the question contains:

- this developer
- this profile
- this user
- my profile
- my account
- my repositories
- my followers
- my stars
- my forks
- my commits

assume it refers to:

${username}

--------------------------------------------------

PROFILE QUESTIONS

Examples:

- Who am I?
- Show my profile
- Show this developer profile
- How many followers does this developer have?
- How many repositories does this developer have?
- When was this account created?
- What is this user's bio?

ALWAYS prefer:

get_me

if that tool exists.

Never use search_users for these questions.

--------------------------------------------------

REPOSITORY SEARCH QUESTIONS

Examples:

- Find Java repositories
- Search React projects
- Search repositories about AI

Use:

search_repositories

--------------------------------------------------

USER SEARCH QUESTIONS

Examples:

- Find users named John
- Search GitHub users from India
- Search developers working on React

Use:

search_users

--------------------------------------------------

ISSUES

Use issue tools only.

--------------------------------------------------

PULL REQUESTS

Use PR tools only.

--------------------------------------------------

COMMITS

Use commit tools only.

--------------------------------------------------

FILES

Use file tools only.

--------------------------------------------------

RULES

1. Prefer exact profile tools over search tools.
2. Never use search_users when asking about the current user.
3. Never invent arguments.
4. Follow inputSchema exactly.
5. Return ONLY JSON.

User Question:

${question}
`;



  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let toolConfig;

  try {
    toolConfig = JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON returned by Gemini:\n${text}`);
  }

  // Validate tool exists
  const selectedTool = availableTools.find(
    (tool) => tool.name === toolConfig.tool,
  );

  if (!selectedTool) {
    throw new Error("Invalid tool selected");
  }

  // Validate required args
  const requiredFields = selectedTool.inputSchema?.required || [];

  for (const field of requiredFields) {
    if (toolConfig.args[field] === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  console.log("\n========== TOOL SELECTED ==========\n");
  console.log(toolConfig);
  console.log("\n===================================\n");

  return toolConfig;
};

module.exports = {
  selectToolWithGemini,
};
