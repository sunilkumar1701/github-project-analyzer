const DASHBOARD_KEYWORDS = [
  "developer score",
  "recruiter ready",
  "portfolio readiness",
  "strongest language",
  "strongest languages",
  "tech stack",
  "technology stack",
  "repository quality",
  "best repository",
  "top repository",
  "most starred",
  "most forked",
  "followers",
  "following",
  "public repos",
  "activity",
  "commits",
];

const DASHBOARD_QUESTIONS = [
  // Developer Score
  "what is my developer score",
  "what's my developer score",
  "what is my score",
  "what's my score",
  "show my score",
  "how is my developer score",
  "why is my developer score",

  // Recruiter Readiness
  "am i recruiter ready",
  "am i ready for recruiters",
  "is my profile recruiter ready",
  "how recruiter ready am i",
  "why am i not recruiter ready",

  // Portfolio Readiness
  "what is my portfolio readiness score",
  "what's my portfolio readiness score",
  "how good is my portfolio",
  "why is my portfolio readiness low",
  "how can i improve portfolio readiness",
  "which portfolio checks failed",

  // Repository Quality
  "what is my repository quality score",
  "what's my repository quality score",
  "why is my repository quality low",
  "how can i improve repository quality",
  "which repository quality metric is weakest",
  "show repository quality",

  // Technology Stack
  "what are my strongest languages",
  "what is my strongest language",
  "which language do i use most",
  "what technologies do i use",
  "show my technology stack",
  "what is my tech stack",
  "top most language used by me",
  "top language of mine",
  "which programming language do i use the most",

  // Repository Analysis
  "what is my best repository",
  "what is my top repository",
  "which repository has the most stars",
  "which repository has the most forks",
  "show my top repository",
  "show my best project",

  // Activity
  "how active am i",
  "show my activity",
  "what is my activity status",
  "how many commits do i have",
  "am i actively contributing",
  "what is my contribution activity",

  // Profile Analysis
  "how many followers do i have",
  "how many following do i have",
  "how many repositories do i have",
  "show my profile stats",
  "show my github stats",
  "tell me about my profile",

  // Dashboard Overview
  "give me a summary",
  "summarize my profile",
  "give me dashboard summary",
  "show dashboard analytics",
  "show profile overview",
];

const determineSource = (message = "") => {
  try {
    if (typeof message !== "string") {
      return "mcp";
    }

    const question = message
      .toLowerCase()
      .trim();

    if (!question) {
      return "mcp";
    }

    const isDashboardKeyword =
      DASHBOARD_KEYWORDS.some((keyword) =>
        question.includes(keyword)
      );

    if (isDashboardKeyword) {
      return "dashboard";
    }

    const isDashboardQuestion =
      DASHBOARD_QUESTIONS.some((query) =>
        question.includes(query)
      );

    return isDashboardQuestion
      ? "dashboard"
      : "mcp";
  } catch (error) {
    console.error(
      "Tool Router Error:",
      error.message
    );

    return "mcp";
  }
};

module.exports = {
  determineSource,
};