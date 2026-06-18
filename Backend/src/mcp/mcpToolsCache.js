let toolsCache = [];

const setToolsCache = (tools) => {
  toolsCache = tools;
};

const getToolsCache = () => {
  return toolsCache;
};

module.exports = {
  setToolsCache,
  getToolsCache,
};