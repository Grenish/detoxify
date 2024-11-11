// Retrieve stored preference and update UI
chrome.storage.sync.get("hideShorts", (data) => {
  const message = document.getElementById("message");
  message.innerText = data.hideShorts
    ? "Shorts are currently hidden."
    : "Shorts are currently visible.";
});

// Toggle button to enable or disable hiding Shorts
document.getElementById("toggle-shorts-btn").addEventListener("click", () => {
  chrome.storage.sync.get("hideShorts", (data) => {
    const newState = !data.hideShorts;

    // Save new state
    chrome.storage.sync.set({ hideShorts: newState }, () => {
      // Update message
      const message = document.getElementById("message");
      message.innerText = newState
        ? "Shorts are now hidden."
        : "Shorts are now visible.";

      // Send message to content script to update Shorts visibility immediately
      chrome.runtime.sendMessage({ action: "updateShortsVisibility" });
    });
  });
});
