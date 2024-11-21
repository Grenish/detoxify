// Constants for selectors and configuration
const SELECTORS = {
  HOME_SHORTS: "ytd-rich-section-renderer",
  SEARCH_SHORTS: "ytd-reel-shelf-renderer",
  SHORTS_TITLE: "#title-text",
  SHORTS_TEXT: "Shorts",
};

const THROTTLE_DELAY = 500;

function hideHomePageShorts(hidden) {
  const shortsSections = document.querySelectorAll(SELECTORS.HOME_SHORTS);
  shortsSections.forEach((section) => {
    const titleElement = section.querySelector(SELECTORS.SHORTS_TITLE);
    if (
      titleElement &&
      titleElement.innerText.trim() === SELECTORS.SHORTS_TEXT
    ) {
      // Use important flag in CSS and handle inline styles properly
      section.setAttribute("style", hidden ? "display: none !important" : "");
    }
  });
}

function hideSearchPageShorts(hidden) {
  const searchShortsElements = document.querySelectorAll(
    SELECTORS.SEARCH_SHORTS
  );
  searchShortsElements.forEach((element) => {
    // Use important flag in CSS and handle inline styles properly
    element.setAttribute("style", hidden ? "display: none !important" : "");
  });
}

function initializeShortsVisibility() {
  // Add error handling for storage access
  chrome.storage.sync.get("hideShorts", (data) => {
    if (chrome.runtime.lastError) {
      console.error("Storage error:", chrome.runtime.lastError);
      return;
    }
    const hidden = Boolean(data.hideShorts);
    hideHomePageShorts(hidden);
    hideSearchPageShorts(hidden);
  });
}

// Improved throttle function with proper closure handling
function createThrottledFunction(callback, delay) {
  let timeoutId = null;
  return function (...args) {
    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        callback.apply(this, args);
        timeoutId = null;
      }, delay);
    }
  };
}

function createObserver(selector, hideFunction) {
  let observer = null;

  const throttledUpdate = createThrottledFunction((hidden) => {
    if (observer) observer.disconnect();
    hideFunction(hidden);
    if (observer) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }, THROTTLE_DELAY);

  observer = new MutationObserver((mutations) => {
    const relevantChange = mutations.some((mutation) =>
      Array.from(mutation.addedNodes).some(
        (node) => node.nodeType === Node.ELEMENT_NODE && node.matches(selector)
      )
    );

    if (relevantChange) {
      chrome.storage.sync.get("hideShorts", (data) => {
        if (chrome.runtime.lastError) {
          console.error("Storage error:", chrome.runtime.lastError);
          return;
        }
        throttledUpdate(Boolean(data.hideShorts));
      });
    }
  });

  return observer;
}

// Message handling with proper response
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateShortsVisibility") {
    chrome.storage.sync.get("hideShorts", (data) => {
      if (chrome.runtime.lastError) {
        console.error("Storage error:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError });
        return;
      }
      const hidden = Boolean(data.hideShorts);
      hideHomePageShorts(hidden);
      hideSearchPageShorts(hidden);
      sendResponse({ success: true });
    });
    return true; // Indicates async response
  }
});

// Initialize with proper error handling
function initialize() {
  try {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeExtension);
    } else {
      initializeExtension();
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

function initializeExtension() {
  initializeShortsVisibility();
  const homeObserver = createObserver(
    SELECTORS.HOME_SHORTS,
    hideHomePageShorts
  );
  const searchObserver = createObserver(
    SELECTORS.SEARCH_SHORTS,
    hideSearchPageShorts
  );

  homeObserver.observe(document.body, { childList: true, subtree: true });
  searchObserver.observe(document.body, { childList: true, subtree: true });
}

initialize();
