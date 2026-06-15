const express = require("express");
const cors = require("cors");

const githubRoutes = require("./routes/github.routes");
const developerScoreRoutes = require("./routes/developerScore.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "GitHub Talent Analyzer Backend Running 🚀",
  });
});

app.use("/api/github", githubRoutes);

app.use(
  "/api/github/developer-score",
  developerScoreRoutes
);

app.use("/api/chat", chatRoutes);

module.exports = app;