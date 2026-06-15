const express = require(
  "express"
);

const router =
  express.Router();

const {
  getProfile,
  getProfileAnalysis,
  getRepositoryAnalysis,
  getTechnologyStackAnalysis,
  getActivityAnalysis,
  getRepositoryQualityAnalysis,
  getPortfolioReadinessAnalysis,
  getMostStarredRepository,
  getMostForkedRepository,
  getActivityStatus
} = require("../controllers/github.controller");

router.get(
  "/profile/:username",
  getProfile
);

router.get(
  "/analysis/:username",
  getProfileAnalysis
);

router.get(
  "/repository-analysis/:username",
  getRepositoryAnalysis
);

router.get(
  "/technology-stack/:username",
  getTechnologyStackAnalysis
);

router.get(
  "/activity-analysis/:username",
  getActivityAnalysis
);


router.get(
  "/repository-quality/:username",
  getRepositoryQualityAnalysis
);
router.get(
  "/portfolio-readiness/:username",
  getPortfolioReadinessAnalysis
);

router.get(
  "/most-starred-repository/:username",
  getMostStarredRepository
);

router.get(
  "/most-forked-repository/:username",
  getMostForkedRepository
);

router.get(
  "/activity-status/:username",
  getActivityStatus
);



module.exports = router;