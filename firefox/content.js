// Use browser-specific API for Firefox
if (typeof browser !== "undefined") {
  var chrome = browser; // Alias for compatibility
}

// Function to hide Shorts on the homepage
function hideHomePageShorts(hidden) {
  const shortsSections = document.querySelectorAll("ytd-rich-section-renderer");
  shortsSections.forEach((section) => {
    const titleElement = section.querySelector("#title-text");
    if (titleElement && titleElement.innerText.trim() === "Shorts") {
      section.style.display = hidden ? "none" : ""; // Toggle visibility
      console.log(`Homepage Shorts set to ${hidden ? "hidden" : "visible"}`);
    }
  });
}

// Function to hide Shorts on the search results page
function hideSearchPageShorts(hidden) {
  const searchShortsElements = document.querySelectorAll(
    "ytd-reel-shelf-renderer"
  );
  searchShortsElements.forEach((element) => {
    element.style.display = hidden ? "none" : ""; // Toggle visibility
    console.log(`Search Shorts set to ${hidden ? "hidden" : "visible"}`);
  });
}

// Initialize Shorts visibility based on stored preference
function initializeShortsVisibility() {
  chrome.storage.sync
    .get("hideShorts")
    .then((data) => {
      const isHidden = data.hideShorts || false;
      hideHomePageShorts(isHidden);
      hideSearchPageShorts(isHidden);
      console.log("Initial Shorts visibility set to:", isHidden);
    })
    .catch((error) => {
      console.error("Error retrieving storage data:", error);
    });
}

// Observe dynamically loaded homepage Shorts
function observeHomePageShorts() {
  const observer = new MutationObserver(() => {
    chrome.storage.sync
      .get("hideShorts")
      .then((data) => {
        hideHomePageShorts(data.hideShorts || false);
      })
      .catch((error) => {
        console.error("Error in homepage observer:", error);
      });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Observe dynamically loaded search Shorts
function observeSearchPageShorts() {
  const observer = new MutationObserver(() => {
    chrome.storage.sync
      .get("hideShorts")
      .then((data) => {
        hideSearchPageShorts(data.hideShorts || false);
      })
      .catch((error) => {
        console.error("Error in search observer:", error);
      });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Listen for visibility toggle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateShortsVisibility") {
    chrome.storage.sync
      .get("hideShorts")
      .then((data) => {
        const isHidden = data.hideShorts || false;
        hideHomePageShorts(isHidden);
        hideSearchPageShorts(isHidden);
        console.log("Updated Shorts visibility to:", isHidden);
      })
      .catch((error) => {
        console.error("Error updating Shorts visibility:", error);
      });
  }
});

// Initialize and observe
try {
  initializeShortsVisibility();
  observeHomePageShorts();
  observeSearchPageShorts();
} catch (error) {
  console.error("Error initializing Shorts hiding:", error);
}
