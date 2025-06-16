// Polyfill for Firefox compatibility
if (typeof browser !== "undefined") {
  chrome = browser;
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-shorts-btn");
  const message = document.getElementById("message");
  
  /**
   * Updates UI elements based on Shorts visibility state
   * @param {boolean} isHidden - Whether Shorts are hidden
   */
  function updateUI(isHidden) {
    message.innerText = isHidden
      ? "Shorts are currently hidden."
      : "Shorts are currently visible.";
    toggleButton.textContent = isHidden ? "Unhide Shorts" : "Hide Shorts";
  }

  // Initialize UI on popup load
  chrome.storage.sync.get({ hideShorts: false }, (data) => {
    const isHidden =
      data && data.hideShorts !== undefined ? data.hideShorts : false;
    updateUI(isHidden);
  });

  // Toggle button click handler with error handling
  toggleButton.addEventListener("click", () => {
    toggleButton.disabled = true;
    
    chrome.storage.sync.get({ hideShorts: false }, (data) => {
      const currentState =
        data && data.hideShorts !== undefined ? data.hideShorts : false;
      const newState = !currentState;

      chrome.storage.sync.set({ hideShorts: newState }, () => {
        updateUI(newState);
        
        message.innerText = newState
          ? "Shorts are now hidden. Reloading pages..."
          : "Shorts are now visible. Reloading pages...";

        // Send message to content script to update visibility immediately if possible
        chrome.runtime.sendMessage({ action: "updateShortsVisibility" });

        // Reload YouTube tabs to apply changes
        chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
          if (!tabs || tabs.length === 0) {
            message.innerText = newState
              ? "Shorts are now hidden. Changes will apply when you visit YouTube."
              : "Shorts are now visible. Changes will apply when you visit YouTube.";
            toggleButton.disabled = false;
            return;
          }
          
          let reloadedCount = 0;
          let errorCount = 0;
          
          tabs.forEach((tab) => {
            chrome.tabs.reload(tab.id, () => {
              if (chrome.runtime.lastError) {
                errorCount++;
                console.error(
                  "Error reloading tab:",
                  chrome.runtime.lastError.message
                );
              } else {
                reloadedCount++;
              }
              
              if ((reloadedCount + errorCount) === tabs.length) {
                message.innerText = newState
                  ? "Shorts are now hidden."
                  : "Shorts are now visible.";
                toggleButton.disabled = false;
              }
            });
          });
        });
      });
    });
  });
});
