const { determineSource } = require("../utils/toolRouter");
const { processQuestion } = require("../services/chat.service");

const asyncHandler = require("../middleware/asyncHandler");

const chatWithGithub = asyncHandler(async (req, res) => {
  const {
    username,
    message,
    dashboardContext,
  } = req.body;

  /*
   * Basic Validation
   */
  if (!username || !message) {
    return res.status(400).json({
      success: false,
      answer: "Username and message are required.",
    });
  }

  const source = determineSource(message);

  const result = await processQuestion({
    username,
    source,
    dashboardContext,
    question: message,
  });

  return res.status(200).json({
    success: true,
    source: result.source,
    answer: result.answer,
  });
});

module.exports = {
  chatWithGithub,
};