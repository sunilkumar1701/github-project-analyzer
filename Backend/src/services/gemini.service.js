const ai = require("../config/gemini");

const selectToolWithGemini = async (question) => {
  const prompt = `
You are a GitHub MCP tool selector.

Available Tools:

1. get_me
   - Get authenticated user profile

2. list_contributors
   - Get repository contributors

3. search_repositories
   - Search repositories

Return ONLY JSON.

Examples:

Question:
Who am I

Response:
{
  "tool":"get_me",
  "args":{}
}

Question:
Show contributors

Response:
{
  "tool":"list_contributors",
  "args":{}
}

Question:
Find Java repositories

Response:
{
  "tool":"search_repositories",
  "args":{
      "query":"Java"
  }
}

User Question:
${question}
`;

  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

  const text = response.text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(text);
};

module.exports = {
  selectToolWithGemini,
};