const express = require("express");
const cors = require("cors");

const githubRoutes =
  require("./routes/github.routes");

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

module.exports = app;