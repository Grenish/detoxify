const THROTTLE_MS = 300;

/**
 * Throttled MutationObserver + YouTube SPA navigation hooks.
 */
export function createPageObserver(onChange) {
  let timer = null;
  let lastUrl = location.href;
  let observer = null;

  const schedule = () => {
    if (timer != null) return;
    timer = setTimeout(() => {
      timer = null;
      const url = location.href;
      const navigated = url !== lastUrl;
      if (navigated) lastUrl = url;
      onChange({ navigated, url });
    }, THROTTLE_MS);
  };

  const start = () => {
    if (observer) return;
    observer = new MutationObserver(schedule);
    const root = document.documentElement || document.body;
    if (root) {
      observer.observe(root, { childList: true, subtree: true });
    }

    // YouTube soft navigation events
    document.addEventListener("yt-navigate-finish", schedule, true);
    document.addEventListener("yt-page-data-updated", schedule, true);
    window.addEventListener("popstate", schedule);

    // Fallback URL poll for SPA edge cases
    const urlPoll = setInterval(() => {
      if (location.href !== lastUrl) schedule();
    }, 1000);

    return () => {
      clearInterval(urlPoll);
    };
  };

  let stopUrlPoll = null;

  return {
    start() {
      stopUrlPoll = start() || null;
    },
    stop() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (timer != null) {
        clearTimeout(timer);
        timer = null;
      }
      document.removeEventListener("yt-navigate-finish", schedule, true);
      document.removeEventListener("yt-page-data-updated", schedule, true);
      window.removeEventListener("popstate", schedule);
      if (stopUrlPoll) stopUrlPoll();
    },
    kick: schedule,
  };
}
