/**
 * Shared functionality for filtering YouTube videos by tags/keywords
 */

/**
 * Checks if a video element should be filtered based on user-defined tags
 * @param {HTMLElement} videoElement - The video element to check
 * @param {Array<string>} filterTags - Array of case-insensitive keywords to filter
 * @returns {boolean} - True if video should be hidden, false otherwise
 */
function shouldFilterVideo(videoElement, filterTags) {
  if (!videoElement || !filterTags || filterTags.length === 0) return false;
  
  try {
    // Get title element based on YouTube's structure
    const titleElement = videoElement.querySelector('#video-title, .title.ytd-video-renderer');
    if (!titleElement || !titleElement.textContent) return false;
    
    const videoTitle = titleElement.textContent.toLowerCase().trim();
    
    // Check if any filter tag is in the title
    return filterTags.some(tag => {
      const trimmedTag = tag.toLowerCase().trim();
      return trimmedTag && videoTitle.includes(trimmedTag);
    });
  } catch (error) {
    console.error('Detoxify [shouldFilterVideo]:', error);
    return false;
  }
}

/**
 * Filters videos in the feed based on filter tags
 * @param {Array<string>} filterTags - Array of keywords to filter
 */
function filterFeedVideos(filterTags) {
  try {
    if (!filterTags || filterTags.length === 0) return;
    
    // Target feed video elements
    const feedVideoSelectors = [
      'ytd-video-renderer', // Standard feed videos
      'ytd-grid-video-renderer', // Grid style videos
      'ytd-compact-video-renderer', // Compact video items
    ];
    
    feedVideoSelectors.forEach(selector => {
      const videoElements = document.querySelectorAll(selector);
      videoElements.forEach(video => {
        if (shouldFilterVideo(video, filterTags)) {
          setImportantStyle(video, true);
        }
      });
    });
  } catch (error) {
    console.error('Detoxify [filterFeedVideos]:', error);
  }
}

/**
 * Updates the visibility of videos based on filter settings
 * @param {Array<string>} filterTags - Array of keywords to filter
 * @param {boolean} filtersEnabled - Whether filtering is enabled
 */
function updateVideoFiltering(filterTags, filtersEnabled) {
  try {
    // Get all feed videos
    const feedVideoSelectors = [
      'ytd-video-renderer',
      'ytd-grid-video-renderer',
      'ytd-compact-video-renderer',
    ];
    
    feedVideoSelectors.forEach(selector => {
      const videoElements = document.querySelectorAll(selector);
      videoElements.forEach(video => {
        // If filters are disabled, show all videos
        if (!filtersEnabled) {
          setImportantStyle(video, false);
          return;
        }
        
        // Otherwise, check if video should be filtered
        const shouldHide = shouldFilterVideo(video, filterTags);
        setImportantStyle(video, shouldHide);
      });
    });
  } catch (error) {
    console.error('Detoxify [updateVideoFiltering]:', error);
  }
}
