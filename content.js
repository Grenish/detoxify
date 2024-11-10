function hideYouTubeShorts() {
  // Hide Shorts on the Home page
  const shortsSections = document.querySelectorAll("ytd-rich-section-renderer");
  shortsSections.forEach((section) => {
    const titleElement = section.querySelector("#title-text");
    if (titleElement && titleElement.innerText.trim() === "Shorts") {
      section.style.display = "none"; // Hide the section completely
    }
  });

  // Hide Shorts in Search Results
  const searchShortsSections = document.querySelectorAll(
    "ytd-item-section-renderer"
  );
  searchShortsSections.forEach((section) => {
    const titleElement = section.querySelector("#title");
    if (titleElement && titleElement.innerText.trim() === "Shorts") {
      section.style.display = "none"; // Hide the section completely
    }
  });
}

function observeShorts() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length || mutation.removedNodes.length) {
        try {
          hideYouTubeShorts();
        } catch (error) {
          console.error("Error hiding YouTube Shorts:", error);
        }
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

try {
  hideYouTubeShorts();
  observeShorts();
} catch (error) {
  console.error("Error initializing Shorts hiding:", error);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleShortsVisibility") {
    try {
      hideYouTubeShorts();
    } catch (error) {
      console.error("Error toggling Shorts visibility:", error);
    }
  }
});
