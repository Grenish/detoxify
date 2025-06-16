/**
 * Shared utilities for Detoxify extension
 */

/**
 * Creates a throttled function to limit execution frequency
 * @param {Function} callback - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
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
 * Sets inline style with !important to ensure it overrides YouTube styles
 * @param {HTMLElement} element - DOM element to style
 * @param {boolean} hidden - Whether to hide the element
 */
function setImportantStyle(element, hidden) {
  if (!element) return;
  element.setAttribute(
    "style", 
    hidden ? "display: none !important" : ""
  );
}

/**
 * Logs errors with consistent format
 * @param {string} context - Context where error occurred
 * @param {Error} error - Error object
 */
function logError(context, error) {
  console.error(`Detoxify [${context}]:`, error);
}

/**
 * Gets storage value with Promise interface
 * @param {string} key - Storage key
 * @returns {Promise} Promise resolving to storage value
 */
function getStorageValue(key) {
  return new Promise((resolve, reject) => {
    try {
      // Handle Firefox/Chrome API differences
      const browserAPI = typeof browser !== "undefined" ? browser : chrome;
      browserAPI.storage.sync.get(key, (data) => {
        if (browserAPI.runtime.lastError) {
          reject(browserAPI.runtime.lastError);
          return;
        }
        resolve(data[key]);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Sets storage value with Promise interface
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {Promise} Promise resolving when storage is set
 */
function setStorageValue(key, value) {
  return new Promise((resolve, reject) => {
    try {
      // Handle Firefox/Chrome API differences
      const browserAPI = typeof browser !== "undefined" ? browser : chrome;
      const data = {};
      data[key] = value;
      
      browserAPI.storage.sync.set(data, () => {
        if (browserAPI.runtime.lastError) {
          reject(browserAPI.runtime.lastError);
          return;
        }
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
