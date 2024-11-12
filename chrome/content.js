function hideHomePageShorts(hidden) {
  const shortsSections = document.querySelectorAll("ytd-rich-section-renderer");
  shortsSections.forEach((section) => {
    const titleElement = section.querySelector("#title-text");
    if (titleElement && titleElement.innerText.trim() === "Shorts") {
      section.style.display = hidden ? "none" : ""; // Set display based on hidden state
    }
  });
}

function initializeShortsVisibility() {
  chrome.storage.sync.get("hideShorts", (data) => {
    hideHomePageShorts(data.hideShorts || false);
  });
}

let throttleTimeout;
function throttledHideHomePageShorts(observer) {
  if (!throttleTimeout) {
    throttleTimeout = setTimeout(() => {
      observer.disconnect();
      chrome.storage.sync.get("hideShorts", (data) => {
        hideHomePageShorts(data.hideShorts || false);
      });
      observer.observe(document.body, { childList: true, subtree: true });
      throttleTimeout = null;
    }, 500);
  }
}

function observeHomePageShorts() {
  const observer = new MutationObserver((mutations) => {
    let relevantChange = false;

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.matches("ytd-rich-section-renderer")) {
          relevantChange = true;
        }
      });
    });

    if (relevantChange) {
      throttledHideHomePageShorts(observer);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateShortsVisibility") {
    chrome.storage.sync.get("hideShorts", (data) => {
      hideHomePageShorts(data.hideShorts || false);
    });
  }
});

try {
  initializeShortsVisibility(); // Set initial state on load
  observeHomePageShorts();
} catch (error) {
  console.error("Error initializing Shorts hiding:", error);
}
