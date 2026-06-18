const githubErrorHandler = (
  error,
  defaultMessage = "GitHub request failed."
) => {
  console.error(
    "GitHub Service Error:",
    error.response?.data || error.message
  );

  if (error.response) {
    const status = error.response.status;

    switch (status) {
      case 404:
        throw new Error(
          "GitHub resource not found."
        );

      case 403:
        throw new Error(
          "GitHub API rate limit exceeded."
        );

      case 401:
        throw new Error(
          "Invalid GitHub credentials."
        );

      default:
        throw new Error(
          error.response.data?.message ||
            defaultMessage
        );
    }
  }

  throw new Error(
    error.message || defaultMessage
  );
};

module.exports = githubErrorHandler;