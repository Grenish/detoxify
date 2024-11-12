chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateShortsVisibility") {
    // Get all YouTube tabs and send them a message to update Shorts visibility
    chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("Could not query tabs:", chrome.runtime.lastError);
        return;
      }

      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { action: "toggleShortsVisibility" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error sending message to content script:",
                chrome.runtime.lastError
              );
            }
          }
        );
      });
    });
  }
});
