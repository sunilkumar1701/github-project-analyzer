const express =
  require("express");

const {
  getDeveloperScore,
} = require(
  "../controllers/developerScore.controller"
);

const router =
  express.Router();

router.get(
  "/:username",
  getDeveloperScore
);

module.exports = router;