const ai = require("../config/gemini");

const MODEL_NAME = "gemini-2.5-flash";

const generateErrorAnswer = async ({ question, error }) => {
  try {
    const prompt = `
You are a professional GitHub AI Assistant.

User Question:
"${question}"

Problem:
"${error}"

Instructions:

1. Explain the issue in simple language.
2. Never mention internal errors, stack traces, JSON, APIs, Gemini, MCP, or implementation details.
3. Be polite and professional.
4. Explain what you are unable to do.
5. Suggest what the assistant can help with instead.
6. Use markdown formatting.
7. Use bullet points when appropriate.
8. Return ONLY the final answer.

Example:

❌ I currently cannot generate PDF files.

However, I can help you with:

- Repository analysis
- Pull requests
- Issues
- User profiles
- Organizations
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const answer = response?.text?.trim();

    if (!answer) {
      return defaultErrorMessage();
    }

    return answer;
  } catch (err) {
    console.error("Error Answer Generation Failed:", err.message);

    return defaultErrorMessage();
  }
};

const defaultErrorMessage = () => `
❌ I couldn't complete this request.

However, I can still help you with:

- Repository analysis
- User profiles
- Repository statistics
- Pull requests
- Issues
- Organizations

Please try another GitHub-related question.
`;

module.exports = {
  generateErrorAnswer,
};
