const { determineSource } = require("../utils/toolRouter");

const { processQuestion } = require("../services/chat.service");

const chatWithGithub = async (req, res) => {
  try {
    const { username, message, dashboardContext } = req.body;

    const source = determineSource(message);

    const result = await processQuestion({
      username,
      source,
      dashboardContext,
      question: message,
    });

    return res.status(200).json({
      success: true,
      source,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  chatWithGithub,
};
