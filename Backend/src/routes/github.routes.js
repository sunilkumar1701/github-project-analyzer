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
} = require(
  "../controllers/github.controller"
);

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

module.exports = router;