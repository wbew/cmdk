// src/background.ts
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-cmdk") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { action: "toggle-cmdk" });
    }
  }
});
