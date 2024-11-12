document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-shorts-btn");
  const message = document.getElementById("message");

  chrome.storage.sync.get("hideShorts", (data) => {
    const isHidden = data.hideShorts || false;
    message.innerText = isHidden
      ? "Shorts are currently hidden."
      : "Shorts are currently visible.";
    toggleButton.textContent = isHidden ? "Unhide Shorts" : "Hide Shorts";
  });

  toggleButton.addEventListener("click", () => {
    chrome.storage.sync.get("hideShorts", (data) => {
      const newState = !data.hideShorts;

      chrome.storage.sync.set({ hideShorts: newState }, () => {
        message.innerText = newState
          ? "Shorts are now hidden."
          : "Shorts are now visible.";
        toggleButton.textContent = newState ? "Unhide Shorts" : "Hide Shorts";

        chrome.runtime.sendMessage({ action: "updateShortsVisibility" });

        chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
          tabs.forEach((tab) => {
            chrome.tabs.reload(tab.id);
          });
        });
      });
    });
  });
});
