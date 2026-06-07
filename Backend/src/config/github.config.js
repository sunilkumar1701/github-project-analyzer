const axios = require("axios");

const githubApi = axios.create({
  baseURL: process.env.GITHUB_API,
  timeout: 10000,
  headers: {
    Accept: "application/vnd.github+json",

    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
});

module.exports = githubApi;