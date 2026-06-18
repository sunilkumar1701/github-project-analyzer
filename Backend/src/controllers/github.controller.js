const githubService = require("../services/github.service");

const asyncHandler = require("../middleware/asyncHandler");

const validateUsername = (username) => {
  return Boolean(username?.trim());
};

const getProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username is required.",
    });
  }

  const profile = await githubService.getGithubProfile(username);

  return res.status(200).json({
    success: true,
    data: {
      name: profile?.name,
      login: profile?.login,
      avatar_url: profile?.avatar_url,
      location: profile?.location,
      blog: profile?.blog,
    },
  });
});

const getProfileAnalysis = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username is required.",
    });
  }

  const data = await githubService.getProfileAnalysis(username);

  return res.status(200).json({
    success: true,
    data,
  });
});

const getRepositoryAnalysis = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username is required.",
    });
  }

  const data = await githubService.getRepositoryAnalysis(username);

  return res.status(200).json({
    success: true,
    data,
  });
});

const getTechnologyStackAnalysis = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username is required.",
    });
  }

  const data = await githubService.getTechnologyStackAnalysis(username);

  return res.status(200).json({
    success: true,
    data,
  });
});

const getActivityAnalysis = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username is required.",
    });
  }

  const data = await githubService.getActivityAnalysis(username);

  return res.status(200).json({
    success: true,
    data,
  });
});

const getRepositoryQualityAnalysis = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username is required.",
    });
  }

  const data = await githubService.getRepositoryQualityAnalysis(username);

  return res.status(200).json({
    success: true,
    data,
  });
});

const getPortfolioReadinessAnalysis = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username is required.",
    });
  }

  const data = await githubService.getPortfolioReadinessAnalysis(username);

  return res.status(200).json({
    success: true,
    data,
  });
});

const getMostStarredRepository = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username is required.",
    });
  }

  const data = await githubService.getMostStarredRepository(username);

  return res.status(200).json({
    success: true,
    data,
  });
});

const getMostForkedRepository = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username is required.",
    });
  }

  const data = await githubService.getMostForkedRepository(username);

  return res.status(200).json({
    success: true,
    data,
  });
});

const getActivityStatus = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!validateUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username is required.",
    });
  }

  const data = await githubService.getActivityStatus(username);

  return res.status(200).json({
    success: true,
    data,
  });
});

module.exports = {
  getProfile,
  getProfileAnalysis,
  getRepositoryAnalysis,
  getTechnologyStackAnalysis,
  getActivityAnalysis,
  getRepositoryQualityAnalysis,
  getPortfolioReadinessAnalysis,
  getMostStarredRepository,
  getMostForkedRepository,
  getActivityStatus,
};
