/**
 * Redirect away from the Shorts player surface when enabled.
 */
export function applyShortsRedirect(settings) {
  if (!settings.hideShorts || !settings.redirectShorts) return;

  const path = location.pathname || "";
  if (path === "/shorts" || path.startsWith("/shorts/")) {
    // Use replace so Back doesn't bounce into Shorts again
    location.replace("https://www.youtube.com/");
  }
}
