// Polyfill for Firefox compatibility
if (typeof browser !== "undefined") {
  chrome = browser;
}

function hideHomePageShorts(hidden) {
  const shortsSections = document.querySelectorAll("ytd-rich-section-renderer");
  shortsSections.forEach((section) => {
    const titleElement = section.querySelector("#title-text");
    if (titleElement && titleElement.innerText.trim() === "Shorts") {
      section.style.display = hidden ? "none" : ""; // Set display based on hidden state
      console.log(`Shorts visibility set to ${hidden ? "hidden" : "visible"}`);
    }
  });
}

// Initialize visibility based on storage
function initializeShortsVisibility() {
  chrome.storage.sync.get({ hideShorts: false }, (data) => {
    const isHidden =
      data && data.hideShorts !== undefined ? data.hideShorts : false;
    hideHomePageShorts(isHidden);
    console.log("Initial Shorts visibility:", isHidden);
  });
}

// Listen for visibility toggle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateShortsVisibility") {
    chrome.storage.sync.get({ hideShorts: false }, (data) => {
      const isHidden =
        data && data.hideShorts !== undefined ? data.hideShorts : false;
      hideHomePageShorts(isHidden);
      console.log("Updated Shorts visibility:", isHidden);
    });
  }
});

try {
  initializeShortsVisibility(); // Set initial state on load
} catch (error) {
  console.error("Error initializing Shorts hiding:", error);
}
