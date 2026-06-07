import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/github";

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

export const getRepositoryAnalysis =
  async (username) => {
    const response = await axios.get(
      `${API_BASE_URL}/repository-analysis/${username}`
    );

    return response.data.data;
  };

  export const getTechnologyStackAnalysis =
  async (username) => {

    const response =
      await axios.get(
        `${API_BASE_URL}/technology-stack/${username}`
      );

    return response.data.data;
  };