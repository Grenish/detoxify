chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateShortsVisibility") {
    chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("Could not query tabs:", chrome.runtime.lastError);
        return;
      }

      tabs.forEach((tab) => {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ["content.js"],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error injecting content script:",
                chrome.runtime.lastError.message
              );
              return;
            }

            chrome.tabs.sendMessage(
              tab.id,
              { action: "toggleShortsVisibility" },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.error(
                    "Error sending message to content script:",
                    chrome.runtime.lastError.message
                  );
                }
              }
            );
          }
        );
      });
    });
  }
});
