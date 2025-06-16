// Import shared utilities
// Note: In production, you'd use import statements
// but for extension compatibility, assume these are loaded via manifest

/**
 * Detoxify YouTube Content Script
 * Hides Shorts from YouTube interface
 */

// Use browserAPI for cross-browser compatibility
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

/**
 * Hides Shorts sections on the homepage
 * @param {boolean} hidden - Whether to hide Shorts
 */
function hideHomePageShorts(hidden) {
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
}

/**
 * Hides Shorts in search results
 * @param {boolean} hidden - Whether to hide Shorts
 */
function hideSearchPageShorts(hidden) {
  const searchShortsElements = document.querySelectorAll(
    SELECTORS.SEARCH_SHORTS
  );
  searchShortsElements.forEach((element) => {
    setImportantStyle(element, hidden);
  });
}

/**
 * Hides Shorts from sidebar navigation
 * @param {boolean} hidden - Whether to hide Shorts
 */
function hideSidebarShorts(hidden) {
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
    // More comprehensive selector to find video titles
    const titleElement = videoElement.querySelector('#video-title, .title.ytd-video-renderer, .title');
    if (!titleElement || !titleElement.textContent) return false;
    
    const videoTitle = titleElement.textContent.toLowerCase().trim();
    console.debug(`Detoxify: Checking "${videoTitle.substring(0, 30)}..." against ${filterTags.length} tags`);
    
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
    // Expanded list of selectors for all video types
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
 * Updates visibility of all Shorts elements
 * @param {boolean} hidden - Whether to hide Shorts
 */
function updateAllShortsVisibility(hidden) {
  try {
    hideHomePageShorts(hidden);
    hideSearchPageShorts(hidden);
    hideSidebarShorts(hidden);
  } catch (error) {
    logError("updateAllShortsVisibility", error);
  }
}

/**
 * Initializes Shorts visibility based on stored preference
 */
function initializeShortsVisibility() {
  getStorageValue(CONFIG.STORAGE_KEY)
    .then(storedValue => {
      const hidden = Boolean(storedValue);
      updateAllShortsVisibility(hidden);
    })
    .catch(error => logError("initializeShortsVisibility", error));
}

/**
 * Initialize video filters based on stored preference
 */
function initializeVideoFilters() {
  getStorageValue(CONFIG.FILTER_TAGS_KEY)
    .then(filterTags => {
      getStorageValue(CONFIG.FILTERS_ENABLED_KEY)
        .then(filtersEnabled => {
          filterVideos(filterTags || [], Boolean(filtersEnabled));
        });
    })
    .catch(error => logError("initializeVideoFilters", error));
}

/**
 * Creates a mutation observer for automatic updates
 * @param {string} selector - CSS selector to watch for
 * @param {Function} updateFunction - Function to call when elements match
 * @returns {MutationObserver} Configured observer
 */
function createObserver(selector, updateFunction) {
  let observer = null;

  const throttledUpdate = createThrottledFunction((hidden) => {
    if (observer) observer.disconnect();
    updateFunction(hidden);
    if (observer) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }, CONFIG.THROTTLE_DELAY);

  observer = new MutationObserver(() => {
    getStorageValue(CONFIG.STORAGE_KEY)
      .then(storedValue => throttledUpdate(Boolean(storedValue)))
      .catch(error => logError("observerUpdate", error));
  });

  return observer;
}

// Message handling with proper response
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === CONFIG.UPDATE_ACTION) {
    getStorageValue(CONFIG.STORAGE_KEY)
      .then(storedValue => {
        const hidden = Boolean(storedValue);
        updateAllShortsVisibility(hidden);
        sendResponse({ success: true });
      })
      .catch(error => {
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
 * Main initialization function
 */
function initialize() {
  try {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeExtension);
    } else {
      initializeExtension();
    }
  } catch (error) {
    logError("initialize", error);
  }
}

/**
 * Sets up observers and initial state
 */
function initializeExtension() {
  initializeShortsVisibility();
  initializeVideoFilters();
  
  // Create one main observer that handles all updates
  const mainObserver = new MutationObserver(() => {
    getStorageValue(CONFIG.STORAGE_KEY)
      .then(storedValue => {
        const hidden = Boolean(storedValue);
        updateAllShortsVisibility(hidden);
        
        getStorageValue(CONFIG.FILTER_TAGS_KEY)
          .then(filterTags => {
            getStorageValue(CONFIG.FILTERS_ENABLED_KEY)
              .then(filtersEnabled => {
                if (filtersEnabled && filterTags && filterTags.length > 0) {
                  console.debug('Detoxify: Observer triggered, applying filters');
                }
                filterVideos(filterTags || [], Boolean(filtersEnabled));
              });
          });
      })
      .catch(error => logError("mainObserver", error));
  });
  
  // Start observing with a more efficient configuration
  mainObserver.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: false,
    characterData: false
  });
  
  // Periodic check for videos that might have been missed
  setInterval(() => {
    getStorageValue(CONFIG.FILTER_TAGS_KEY)
      .then(filterTags => {
        getStorageValue(CONFIG.FILTERS_ENABLED_KEY)
          .then(filtersEnabled => {
            if (filtersEnabled && filterTags && filterTags.length > 0) {
              console.debug('Detoxify: Periodic check for videos');
              filterVideos(filterTags || [], Boolean(filtersEnabled));
            }
          });
      })
      .catch(error => logError("periodicCheck", error));
  }, 2500);
}

// Start the extension
initialize();
