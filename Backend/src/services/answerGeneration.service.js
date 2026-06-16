const ai = require("../config/gemini");

const generateAnswer = async ({
  question,
  data,
}) => {
  const prompt = `
You are a GitHub Analyst AI.

Question:
${question}

Data:
${JSON.stringify(data, null, 2)}

Generate a concise and professional answer.

Do not explain the raw JSON.
Summarize it for the user.
`;

  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

  return response.text;
};

module.exports = {
  generateAnswer,
};