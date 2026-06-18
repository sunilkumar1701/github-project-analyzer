const githubService = require("../services/github.service");

const asyncHandler = require("../middleware/asyncHandler");

const getDeveloperScore = asyncHandler(async (req, res) => {
  const { username } = req.params;

  /*
   * Validation
   */
  if (!username?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Username is required.",
    });
  }

  const data = await githubService.getDeveloperScore(username);

  return res.status(200).json({
    success: true,
    data,
  });
});

module.exports = {
  getDeveloperScore,
};
