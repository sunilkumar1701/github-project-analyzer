const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  const statusCode =
    res.statusCode !== 200
      ? res.statusCode
      : err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    answer:
      err.message ||
      "Internal Server Error",
  });
};

module.exports = errorHandler;