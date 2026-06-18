const determineSource = (message = "") => {
  const question = message.toLowerCase().trim();

   // Intent-based detection
  if (
    question.includes("developer score") ||
    question.includes("recruiter ready") ||
    question.includes("portfolio readiness") ||
    question.includes("strongest language") ||
    question.includes("strongest languages") ||
    question.includes("tech stack") ||
    question.includes("technology stack") ||
    question.includes("repository quality") ||
    question.includes("best repository") ||
    question.includes("top repository") ||
    question.includes("most starred") ||
    question.includes("most forked") ||
    question.includes("followers") ||
    question.includes("following") ||
    question.includes("public repos") ||
    question.includes("activity") ||
    question.includes("commits")
  ) {
    return "dashboard";
  }
  
  const dashboardQuestions = [

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
    "show profile overview"
  ];

  return dashboardQuestions.some(q =>
    question.includes(q)
  )
    ? "dashboard"
    : "mcp";
};

module.exports = {
  determineSource,
};