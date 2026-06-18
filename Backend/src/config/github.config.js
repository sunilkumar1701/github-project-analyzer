const axios = require("axios");

if (!process.env.GITHUB_API) {
  throw new Error("GITHUB_API is missing in environment variables.");
}

if (!process.env.GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN is missing in environment variables.");
}

const githubApi = axios.create({
  baseURL: process.env.GITHUB_API,
  timeout: 10000,
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    "User-Agent": "GitHub-Talent-Analyzer",
  },
});

githubApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    /*
     * Ignore expected 404s
     */
    if (
      status === 404 &&
      (
        url.includes("/readme") ||
        url.includes("/commits") ||
        url.includes("/pulls")
      )
    ) {
      return Promise.reject(error);
    }

    /*
     * Log only unexpected errors
     */
    console.error(
      `GitHub API Error ${status || ""}:`,
      error.response?.data?.message || error.message
    );

    return Promise.reject(error);
  }
);

module.exports = githubApi;
