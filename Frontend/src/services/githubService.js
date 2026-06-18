import apiClient from "./apiClient";

const GITHUB_API = "/github";

const fetchData = async (endpoint) => {
  try {
    const response = await apiClient.get(
      `${GITHUB_API}${endpoint}`,
    );

    return response.data.data;
  } catch (error) {
    throw {
      status: error.status,

      message:
        error.message ||
        "Failed to fetch GitHub data.",
    };
  }
};

export const getGithubUsername = () => {
  return new Promise((resolve) => {
    try {
      if (
        typeof chrome === "undefined" ||
        !chrome.tabs
      ) {
        resolve(null);

        return;
      }

      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },

        (tabs) => {
          if (chrome.runtime.lastError) {
            console.error(
              "Chrome Runtime Error:",
              chrome.runtime.lastError.message,
            );

            resolve(null);

            return;
          }

          const url = tabs?.[0]?.url;

          if (!url) {
            resolve(null);

            return;
          }

          /*
            Matches:
            https://github.com/sunilkumar1701
            https://github.com/sunilkumar1701?tab=repositories
            https://github.com/sunilkumar1701/
          */

          const match = url.match(
            /^https:\/\/github\.com\/([^/?#]+)(?:\/)?(?:\?.*)?$/,
          );

          resolve(match?.[1] || null);
        },
      );
    } catch (error) {
      console.error(
        "Username Detection Error:",
        error,
      );

      resolve(null);
    }
  });
};

export const getProfile = (username) =>
  fetchData(`/profile/${username}`);

export const getProfileAnalysis = (
  username,
) => fetchData(`/analysis/${username}`);

export const getRepositoryAnalysis = (
  username,
) =>
  fetchData(
    `/repository-analysis/${username}`,
  );

export const getTechnologyStackAnalysis = (
  username,
) =>
  fetchData(
    `/technology-stack/${username}`,
  );

export const getActivityAnalysis = (
  username,
) =>
  fetchData(
    `/activity-analysis/${username}`,
  );

export const getRepositoryQualityAnalysis = (
  username,
) =>
  fetchData(
    `/repository-quality/${username}`,
  );

export const getPortfolioReadinessAnalysis =
  (username) =>
    fetchData(
      `/portfolio-readiness/${username}`,
    );

export const getMostStarredRepository = (
  username,
) =>
  fetchData(
    `/most-starred-repository/${username}`,
  );

export const getMostForkedRepository = (
  username,
) =>
  fetchData(
    `/most-forked-repository/${username}`,
  );

export const getActivityStatus = (
  username,
) =>
  fetchData(
    `/activity-status/${username}`,
  );

export const getDeveloperScore = (
  username,
) =>
  fetchData(
    `/developer-score/${username}`,
  );