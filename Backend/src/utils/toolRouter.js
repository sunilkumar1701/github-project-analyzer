const determineSource = (message = "") => {
  const question = message.toLowerCase();

  if (
    question.includes("developer score") ||
    question.includes("portfolio") ||
    question.includes("quality") ||
    question.includes("readme") ||
    question.includes("activity status") ||
    question.includes("most starred") ||
    question.includes("best repository") ||
    question.includes("top repository") ||
    question.includes("most forked") ||
    question.includes("language") ||
    question.includes("tech stack") ||
    question.includes("follower") ||
    question.includes("following") ||
    question.includes("profile")
  ) {
    return "dashboard";
  }

  return "mcp";
};

module.exports = {
  determineSource,
};