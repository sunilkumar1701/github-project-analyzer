const ai = require("../config/gemini");

const generateAnswer = async ({
  question,
  data,
}) => {

  const prompt = `
You are an expert GitHub Analyst AI.

User Question:
${question}

Tool Result:
${JSON.stringify(data, null, 2)}

Instructions:

1. Answer the user's question directly.
2. Never mention JSON.
3. Never mention tool results.
4. Extract only useful information.
5. Use bullet points when appropriate.
6. Keep answers concise and professional.
7. If multiple repositories/users are returned:
   show the top 5 most relevant.
8. If no results are found:
   politely say no results were found.
9. Do not hallucinate information.
10. Return ONLY the final answer.

Generate the final answer only.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text.trim();
};

module.exports = {
  generateAnswer,
};