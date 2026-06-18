const ai = require("../config/gemini");

const MODEL_NAME = "gemini-2.5-flash";

const generateAnswer = async ({
  question,
  data,
}) => {
  try {
    if (!question?.trim()) {
      throw new Error("Question is required.");
    }

    const prompt = `
You are an expert GitHub Analyst AI.

User Question:
${question}

Available Data:
${JSON.stringify(data, null, 2)}

Instructions:

1. Answer the user's question directly.
2. Never mention JSON, APIs, tool results, MCP, or internal systems.
3. Extract only relevant information.
4. Use markdown formatting.
5. Use bullet points when appropriate.
6. Keep answers concise, professional, and easy to understand.
7. If multiple repositories or users are returned, show only the top 5 most relevant.
8. If no information is available, politely state that no results were found.
9. Never hallucinate information.
10. Do not fabricate statistics, repositories, or usernames.
11. Use tables only when helpful.
12. Return ONLY the final answer.
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const answer = response?.text?.trim();

    if (!answer) {
      return "I couldn't generate a response for this request.";
    }

    return answer;
  } catch (error) {
    console.error(
      "Answer Generation Error:",
      error.message,
    );

    return (
      error.message ||
      "Unable to generate a response at the moment."
    );
  }
};

module.exports = {
  generateAnswer,
};