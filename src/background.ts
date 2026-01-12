// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// Listen for keyboard command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-cmdk") {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      // Send message to content script
      chrome.tabs.sendMessage(tab.id, { action: "toggle-cmdk" });
    }
  }
});
