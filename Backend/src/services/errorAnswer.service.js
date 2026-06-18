const ai = require("../config/gemini");

const generateErrorAnswer = async ({
  question,
  error,
}) => {

  const prompt = `
You are a professional GitHub AI Assistant.

User asked:
"${question}"

Internal error:
"${error}"

Instructions:

1. Explain the problem in simple language.
2. Never mention internal errors.
3. Never mention JSON parsing.
4. Never mention Gemini.
5. Never mention tools unless necessary.
6. Be polite and professional.
7. Suggest what the assistant CAN do.
8. Return markdown.
9. Return ONLY the final answer.

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
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text.trim();
};

module.exports = {
  generateErrorAnswer,
};