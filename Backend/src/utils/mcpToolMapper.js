const getMcpTool = (question) => {
  const q = question.toLowerCase();

  if (q.includes("who am i")) {
    return {
      tool: "get_me",
      args: {},
    };
  }

  if (q.includes("contributors")) {
    return {
      tool: "list_contributors",
      args: {},
    };
  }

  if (q.includes("repository")) {
    return {
      tool: "search_repositories",
      args: {},
    };
  }

  return null;
};

module.exports = {
  getMcpTool,
};