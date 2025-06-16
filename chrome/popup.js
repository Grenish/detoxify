/**
 * Detoxify YouTube Popup Script
 * Controls the extension popup UI
 */

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
  chrome.storage.sync.get("hideShorts", (data) => {
    const isHidden = data.hideShorts || false;
    updateUI(isHidden);
  });

  // Toggle button click handler
  toggleButton.addEventListener("click", () => {
    toggleButton.disabled = true;
    
    chrome.storage.sync.get("hideShorts", (data) => {
      const newState = !data.hideShorts;

      chrome.storage.sync.set({ hideShorts: newState }, () => {
        updateUI(newState);
        
        message.innerText = newState
          ? "Shorts are now hidden. Reloading pages..."
          : "Shorts are now visible. Reloading pages...";
          
        // Message to update content without reload if possible
        chrome.runtime.sendMessage({ action: "updateShortsVisibility" });

        // Reload YouTube tabs
        chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
          if (tabs.length === 0) {
            message.innerText = newState
              ? "Shorts are now hidden. Changes will apply when you visit YouTube."
              : "Shorts are now visible. Changes will apply when you visit YouTube.";
            toggleButton.disabled = false;
            return;
          }
          
          let reloadedCount = 0;
          
          tabs.forEach((tab) => {
            chrome.tabs.reload(tab.id, {}, () => {
              reloadedCount++;
              if (reloadedCount === tabs.length) {
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
