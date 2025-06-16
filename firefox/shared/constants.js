/**
 * Shared constants for Detoxify extension
 */
const SELECTORS = {
  // Home page shorts section
  HOME_SHORTS: "ytd-rich-section-renderer",
  // Search page shorts section
  SEARCH_SHORTS: "ytd-reel-shelf-renderer",
  // Shorts title text selector
  SHORTS_TITLE: "#title-text",
  // Text content for identifying shorts
  SHORTS_TEXT: "Shorts",
  // Sidebar shorts icon
  SIDEBAR_SHORTS: "ytd-mini-guide-entry-renderer[aria-label='Shorts']",
  // Guide sections for sidebar
  GUIDE_SECTIONS: "ytd-guide-section-renderer",
  // Guide entries in sidebar
  GUIDE_ENTRIES: "ytd-guide-entry-renderer"
  
  // Removing filter-related selectors
};

// Configuration
const CONFIG = {
  // Throttle delay for mutation observers (ms)
  THROTTLE_DELAY: 500,
  // Storage key for shorts visibility
  STORAGE_KEY: "hideShorts",
  // Message action for updating visibility
  UPDATE_ACTION: "updateShortsVisibility",
  // YouTube URL pattern
  YOUTUBE_URL: "*://www.youtube.com/*"
  
  // Removing filter-related constants
};
