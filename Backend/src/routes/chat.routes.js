const express = require("express");

const router = express.Router();

const {
  chatWithGithub,
} = require("../controllers/chat.controller");

router.post("/", chatWithGithub);

module.exports = router;