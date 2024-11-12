// Polyfill for Firefox compatibility
if (typeof browser !== "undefined") {
  chrome = browser;
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-shorts-btn");
  const message = document.getElementById("message");

  // Function to set the message and button text
  function setButtonAndMessage(isHidden) {
    message.innerText = isHidden
      ? "Shorts are currently hidden."
      : "Shorts are currently visible.";
    toggleButton.textContent = isHidden ? "Unhide Shorts" : "Hide Shorts";
  }

  // Initialize button and message on popup load
  chrome.storage.sync.get({ hideShorts: false }, (data) => {
    const isHidden =
      data && data.hideShorts !== undefined ? data.hideShorts : false;
    setButtonAndMessage(isHidden);
  });

  // Toggle button click handler
  toggleButton.addEventListener("click", () => {
    chrome.storage.sync.get({ hideShorts: false }, (data) => {
      const currentState =
        data && data.hideShorts !== undefined ? data.hideShorts : false;
      const newState = !currentState;

      chrome.storage.sync.set({ hideShorts: newState }, () => {
        // Update button text and message
        setButtonAndMessage(newState);

        // Send message to content script to update visibility
        chrome.runtime.sendMessage({ action: "updateShortsVisibility" });

        // Reload YouTube tabs to apply changes
        chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
          tabs.forEach((tab) => {
            chrome.tabs.reload(tab.id, () => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error reloading tab:",
                  chrome.runtime.lastError.message
                );
              }
            });
          });
        });
      });
    });
  });
});
