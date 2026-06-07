const githubService = require(
  "../services/github.service"
);

const getProfile = async (
  req,
  res
) => {
  try {

    const { username } =
      req.params;

    const profile =
      await githubService.getGithubProfile(
        username
      );

    res.status(200).json({
      success: true,

      data: {
        name: profile.name,
        login: profile.login,
        avatar_url:
          profile.avatar_url,
        location:
          profile.location,
        blog: profile.blog,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message:
        error.message,
    });

  }
};

const getProfileAnalysis =
  async (req, res) => {

    try {

      const { username } =
        req.params;

      const data =
        await githubService.getProfileAnalysis(
          username
        );

      res.status(200).json({
        success: true,
        data,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }
  };

const getRepositoryAnalysis =
  async (req, res) => {

    try {

      const { username } =
        req.params;

      const data =
        await githubService.getRepositoryAnalysis(
          username
        );

      res.status(200).json({
        success: true,
        data,
      });

    } catch (error) {

      console.log(
        "STATUS:",
        error.response?.status
      );

      console.log(
        "DATA:",
        error.response?.data
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }
  };

const getTechnologyStackAnalysis =
  async (req, res) => {

    try {

      const { username } =
        req.params;

      const data =
        await githubService.getTechnologyStackAnalysis(
          username
        );

      res.status(200).json({
        success: true,
        data,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }
  };

module.exports = {
  getProfile,
  getProfileAnalysis,
  getRepositoryAnalysis,
  getTechnologyStackAnalysis,
};