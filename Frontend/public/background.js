chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true
  });
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);

  if (!tab.url) return;

  const isGithub = tab.url.startsWith("https://github.com/");

  await chrome.sidePanel.setOptions({
    tabId,
    path: "index.html",
    enabled: isGithub
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url) return;

  const isGithub = tab.url.startsWith("https://github.com/");

  await chrome.sidePanel.setOptions({
    tabId,
    path: "index.html",
    enabled: isGithub
  });
});