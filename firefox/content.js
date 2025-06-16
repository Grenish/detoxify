// Use browser-specific API for Firefox
if (typeof browser !== "undefined") {
  var chrome = browser; // Alias for compatibility
}

/**
 * Detoxify YouTube Content Script for Firefox
 * Hides Shorts from YouTube interface
 */

// Constants imported from shared/constants.js
const SELECTORS = {
  HOME_SHORTS: "ytd-rich-section-renderer",
  SEARCH_SHORTS: "ytd-reel-shelf-renderer",
  SHORTS_TITLE: "#title-text",
  SHORTS_TEXT: "Shorts",
  SIDEBAR_SHORTS: "ytd-mini-guide-entry-renderer[aria-label='Shorts']", 
  GUIDE_SECTIONS: "ytd-guide-section-renderer",
  GUIDE_ENTRIES: "ytd-guide-entry-renderer"
};

const CONFIG = {
  THROTTLE_DELAY: 500,
  STORAGE_KEY: "hideShorts",
  UPDATE_ACTION: "updateShortsVisibility",
  YOUTUBE_URL: "*://www.youtube.com/*",
  FILTER_TAGS_KEY: "filterTags",
  FILTERS_ENABLED_KEY: "filtersEnabled",
  UPDATE_FILTERS_ACTION: "updateVideoFilters"
};

/**
 * Sets inline style with !important to ensure it overrides YouTube styles
 */
function setImportantStyle(element, hidden) {
  if (!element) return;
  element.setAttribute(
    "style", 
    hidden ? "display: none !important" : ""
  );
}

/**
 * Log errors with consistent format
 */
function logError(context, error) {
  console.error(`Detoxify [${context}]:`, error);
}

/**
 * Hide Shorts on the homepage
 */
function hideHomePageShorts(hidden) {
  try {
    const shortsSections = document.querySelectorAll(SELECTORS.HOME_SHORTS);
    shortsSections.forEach((section) => {
      const titleElement = section.querySelector(SELECTORS.SHORTS_TITLE);
      if (
        titleElement &&
        titleElement.innerText.trim() === SELECTORS.SHORTS_TEXT
      ) {
        setImportantStyle(section, hidden);
      }
    });
  } catch (error) {
    logError("hideHomePageShorts", error);
  }
}

/**
 * Hide Shorts on the search results page
 */
function hideSearchPageShorts(hidden) {
  try {
    const searchShortsElements = document.querySelectorAll(
      SELECTORS.SEARCH_SHORTS
    );
    searchShortsElements.forEach((element) => {
      setImportantStyle(element, hidden);
    });
  } catch (error) {
    logError("hideSearchPageShorts", error);
  }
}

/**
 * Hides Shorts from sidebar navigation
 */
function hideSidebarShorts(hidden) {
  try {
    // Hide mini guide shorts icon
    const shortsElement = document.querySelector(SELECTORS.SIDEBAR_SHORTS);
    setImportantStyle(shortsElement, hidden);
    
    // Hide main guide shorts items
    document.querySelectorAll(SELECTORS.GUIDE_SECTIONS).forEach(section => {
      section.querySelectorAll(SELECTORS.GUIDE_ENTRIES).forEach(entry => {
        const title = entry.querySelector('yt-formatted-string');
        if (title && title.textContent.trim() === SELECTORS.SHORTS_TEXT) {
          setImportantStyle(entry, hidden);
        }
      });
    });
  } catch (error) {
    logError("hideSidebarShorts", error);
  }
}

/**
 * Checks if a video should be filtered based on tags
 * @param {HTMLElement} videoElement - Video element to check
 * @param {Array<string>} filterTags - Tags to filter by
 * @returns {boolean} - Whether the video should be filtered
 */
function shouldFilterVideo(videoElement, filterTags) {
  if (!videoElement || !filterTags || filterTags.length === 0) return false;
  
  try {
    // Try multiple selectors to find the title element more reliably
    const titleElement = videoElement.querySelector('#video-title, .title.ytd-video-renderer, .title');
    if (!titleElement || !titleElement.textContent) return false;
    
    const videoTitle = titleElement.textContent.toLowerCase().trim();
    console.debug(`Detoxify: Checking video "${videoTitle.substring(0, 30)}..." against ${filterTags.length} tags`);
    
    return filterTags.some(tag => {
      const trimmedTag = tag.toLowerCase().trim();
      return trimmedTag && videoTitle.includes(trimmedTag);
    });
  } catch (error) {
    logError("shouldFilterVideo", error);
    return false;
  }
}

/**
 * Filter videos based on user-defined tags
 */
function filterVideos(filterTags, enabled) {
  try {
    // Define selectors for all video types
    const videoSelectors = [
      'ytd-video-renderer',
      'ytd-grid-video-renderer', 
      'ytd-compact-video-renderer',
      'ytd-rich-item-renderer',
      'ytd-compact-playlist-renderer'
    ];
    
    if (!enabled) {
      // If filtering is disabled, make sure all videos are visible
      videoSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(video => {
          setImportantStyle(video, false);
        });
      });
      console.debug('Detoxify: Video filtering disabled, all videos visible');
      return;
    }
    
    // If no filter tags, don't hide anything
    if (!filterTags || filterTags.length === 0) {
      console.debug('Detoxify: No filter tags defined, all videos visible');
      return;
    }
    
    let filteredCount = 0;
    videoSelectors.forEach(selector => {
      const videos = document.querySelectorAll(selector);
      console.debug(`Detoxify: Found ${videos.length} videos with selector ${selector}`);
      
      videos.forEach(video => {
        const shouldHide = shouldFilterVideo(video, filterTags);
        if (shouldHide) filteredCount++;
        setImportantStyle(video, shouldHide);
      });
    });
    
    console.debug(`Detoxify: Filtered ${filteredCount} videos based on ${filterTags.length} tags`);
  } catch (error) {
    logError("filterVideos", error);
  }
}

/**
 * Update all Shorts elements visibility
 */
function updateAllShortsVisibility(hidden) {
  hideHomePageShorts(hidden);
  hideSearchPageShorts(hidden);
  hideSidebarShorts(hidden);
}

/**
 * Initialize Shorts visibility based on stored preference
 */
function initializeShortsVisibility() {
  chrome.storage.sync
    .get(CONFIG.STORAGE_KEY)
    .then((data) => {
      const isHidden = data.hideShorts || false;
      updateAllShortsVisibility(isHidden);
    })
    .catch((error) => {
      logError("initializeShortsVisibility", error);
    });
}

/**
 * Initialize video filters based on stored preference
 */
function initializeVideoFilters() {
  chrome.storage.sync
    .get([CONFIG.FILTER_TAGS_KEY, CONFIG.FILTERS_ENABLED_KEY])
    .then((data) => {
      const filterTags = data.filterTags || [];
      const filtersEnabled = data.filtersEnabled || false;
      
      console.debug(`Detoxify: Initializing video filters with ${filterTags.length} tags, enabled: ${filtersEnabled}`);
      filterVideos(filterTags, filtersEnabled);
    })
    .catch((error) => {
      logError("initializeVideoFilters", error);
    });
}

/**
 * Create a throttled function to limit execution frequency
 */
function createThrottledFunction(callback, delay) {
  let timeoutId = null;
  return function(...args) {
    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        callback.apply(this, args);
        timeoutId = null;
      }, delay);
    }
  };
}

/**
 * Create mutation observer for content changes
 */
function createContentObserver() {
  const throttledUpdate = createThrottledFunction(() => {
    chrome.storage.sync
      .get([CONFIG.STORAGE_KEY, CONFIG.FILTER_TAGS_KEY, CONFIG.FILTERS_ENABLED_KEY])
      .then((data) => {
        updateAllShortsVisibility(data.hideShorts || false);
        
        // Run filters more aggressively to catch all videos
        const filterTags = data.filterTags || [];
        const filtersEnabled = data.filtersEnabled || false;
        
        if (filtersEnabled && filterTags.length > 0) {
          console.debug('Detoxify: Observer triggered, applying filters');
          filterVideos(filterTags, filtersEnabled);
        }
      })
      .catch((error) => {
        logError("contentObserver", error);
      });
  }, CONFIG.THROTTLE_DELAY);

  const observer = new MutationObserver(throttledUpdate);
  observer.observe(document.body, { 
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
  
  // Also check periodically for new videos (in case mutation observer misses some)
  setInterval(() => {
    throttledUpdate();
  }, 2500);
  
  return observer;
}

// Listen for visibility toggle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === CONFIG.UPDATE_ACTION) {
    chrome.storage.sync
      .get(CONFIG.STORAGE_KEY)
      .then((data) => {
        const isHidden = data.hideShorts || false;
        updateAllShortsVisibility(isHidden);
        sendResponse({ success: true });
      })
      .catch((error) => {
        logError("messageHandler", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates async response
  }
  
  if (request.action === CONFIG.UPDATE_FILTERS_ACTION) {
    try {
      const { filterTags, filtersEnabled } = request;
      filterVideos(filterTags, filtersEnabled);
      sendResponse({ success: true });
    } catch (error) {
      logError("updateFilters", error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Indicates async response
  }
});

/**
 * Initialize extension
 */
function initialize() {
  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        initializeShortsVisibility();
        initializeVideoFilters();
        createContentObserver();
      });
    } else {
      initializeShortsVisibility();
      initializeVideoFilters();
      createContentObserver();
    }
  } catch (error) {
    logError("initialize", error);
  }
}

// Start the extension
initialize();
