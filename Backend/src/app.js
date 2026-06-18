const express = require("express");
const cors = require("cors");

const githubRoutes = require("./routes/github.routes");
const developerScoreRoutes = require("./routes/developerScore.routes");
const chatRoutes = require("./routes/chat.routes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀",
    status: "healthy",
  });
});

app.use("/api/github", githubRoutes);

app.use("/api/github/developer-score", developerScoreRoutes);

app.use("/api/chat", chatRoutes);

/*
  404 Middleware
*/
app.use(notFound);

/*
  Global Error Middleware
*/
app.use(errorHandler);

module.exports = app;
