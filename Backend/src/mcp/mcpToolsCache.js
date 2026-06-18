let toolsCache = [];

const setToolsCache = (tools = []) => {
  if (!Array.isArray(tools)) {
    throw new Error("toolsCache must be an array.");
  }

  toolsCache = [...tools];
};

const getToolsCache = () => {
  return [...toolsCache];
};

const clearToolsCache = () => {
  toolsCache = [];
};

const hasToolsCache = () => {
  return toolsCache.length > 0;
};

module.exports = {
  setToolsCache,
  getToolsCache,
  clearToolsCache,
  hasToolsCache,
};
