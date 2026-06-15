import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/github";

export const getGithubUsername = () => {
  return new Promise((resolve) => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        if (!tabs.length) {
          resolve(null);
          return;
        }

        const url = tabs[0].url;

        if (!url) {
          resolve(null);
          return;
        }

        const match = url.match(
          /^https:\/\/github\.com\/([^\/?#]+)/
        );

        resolve(match ? match[1] : null);
      }
    );
  });
};

export const getProfile = async (username) => {
  const response = await axios.get(
    `${API_BASE_URL}/profile/${username}`
  );

  return response.data.data;
};

export const getProfileAnalysis = async (username) => {
  const response = await axios.get(
    `${API_BASE_URL}/analysis/${username}`
  );

  return response.data.data;
};

export const getRepositoryAnalysis =async (username) => {
    const response = await axios.get(
      `${API_BASE_URL}/repository-analysis/${username}`
    );

    return response.data.data;
  };

export const getTechnologyStackAnalysis =async (username) => {

    const response =
      await axios.get(
        `${API_BASE_URL}/technology-stack/${username}`
      );

    return response.data.data;
  };

export const getActivityAnalysis = async (
  username
) => {

  const response =
    await axios.get(
      `${API_BASE_URL}/activity-analysis/${username}`
    );

  return response.data.data;
};

export const getRepositoryQualityAnalysis =async (username) => {

    const response =
      await axios.get(
        `${API_BASE_URL}/repository-quality/${username}`
      );

    return response.data.data;
  };

  export const getPortfolioReadinessAnalysis =async (username) => {

    const response =
      await axios.get(
        `${API_BASE_URL}/portfolio-readiness/${username}`
      );

    return response.data.data;
  };

  export const getMostStarredRepository =async (username) => {

    const response =
      await axios.get(
        `${API_BASE_URL}/most-starred-repository/${username}`
      );

    return response.data.data;
  };

  export const getMostForkedRepository = async (username) => {

  const response =
    await axios.get(
      `${API_BASE_URL}/most-forked-repository/${username}`
    );

  return response.data.data;
};

export const getActivityStatus = async (
  username
) => {

  const response =
    await axios.get(
      `${API_BASE_URL}/activity-status/${username}`
    );

  return response.data.data;
};

export const getDeveloperScore =
  async (username) => {
    const response =
      await axios.get(
        `${API_BASE_URL}/developer-score/${username}`
      );

    return response.data.data;
  };