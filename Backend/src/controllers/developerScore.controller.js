const githubService = require(
  "../services/github.service"
);

const getDeveloperScore =
  async (req, res) => {
    try {
      const { username } =
        req.params;

      const data =
        await githubService.getDeveloperScore(
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
  getDeveloperScore,
};