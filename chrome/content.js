function hideHomePageShorts(hidden) {
  const shortsSections = document.querySelectorAll("ytd-rich-section-renderer");
  shortsSections.forEach((section) => {
    const titleElement = section.querySelector("#title-text");
    if (titleElement && titleElement.innerText.trim() === "Shorts") {
      section.style.display = hidden ? "none" : "";
    }
  });
}

function hideSearchPageShorts(hidden) {
  const searchShortsElements = document.querySelectorAll(
    "ytd-reel-shelf-renderer"
  );
  searchShortsElements.forEach((element) => {
    element.style.display = hidden ? "none" : "";
  });
}

function initializeShortsVisibility() {
  chrome.storage.sync.get("hideShorts", (data) => {
    const hidden = data.hideShorts || false;
    hideHomePageShorts(hidden);
    hideSearchPageShorts(hidden);
  });
}

function throttledHideShorts(observer, hideFunction) {
  let throttleTimeout;
  if (!throttleTimeout) {
    throttleTimeout = setTimeout(() => {
      observer.disconnect();
      chrome.storage.sync.get("hideShorts", (data) => {
        hideFunction(data.hideShorts || false);
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
      throttledHideShorts(observer, hideHomePageShorts);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function observeSearchPageShorts() {
  const observer = new MutationObserver((mutations) => {
    let relevantChange = false;

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.matches("ytd-reel-shelf-renderer")) {
          relevantChange = true;
        }
      });
    });

    if (relevantChange) {
      throttledHideShorts(observer, hideSearchPageShorts);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateShortsVisibility") {
    chrome.storage.sync.get("hideShorts", (data) => {
      const hidden = data.hideShorts || false;
      hideHomePageShorts(hidden);
      hideSearchPageShorts(hidden);
    });
  }
});

try {
  initializeShortsVisibility();
  observeHomePageShorts();
  observeSearchPageShorts();
} catch (error) {
  console.error("Error initializing Shorts hiding:", error);
}
