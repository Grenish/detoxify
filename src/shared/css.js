import { STYLE_ID } from "./selectors.js";

/**
 * Build CSS injected into the page based on active flags.
 * Class hooks on <html> drive which rule sets apply.
 */
export function buildDetoxifyCss() {
  return `
/* Detoxify injected styles — do not edit in DevTools permanently */

html.detoxify-hide-shorts ytd-rich-section-renderer:has(a[href*="/shorts/"]),
html.detoxify-hide-shorts ytm-rich-section-renderer:has(a[href*="/shorts/"]),
html.detoxify-hide-shorts ytd-reel-shelf-renderer,
html.detoxify-hide-shorts ytm-reel-shelf-renderer,
html.detoxify-hide-shorts grid-shelf-view-model:has(a[href*="/shorts/"]),
html.detoxify-hide-shorts ytd-rich-shelf-renderer:has(a[href*="/shorts/"]),
html.detoxify-hide-shorts ytd-rich-item-renderer:has(a[href*="/shorts/"]),
html.detoxify-hide-shorts ytm-rich-item-renderer:has(a[href*="/shorts/"]),
html.detoxify-hide-shorts ytd-grid-video-renderer:has(a[href*="/shorts/"]),
html.detoxify-hide-shorts ytd-video-renderer:has(a[href*="/shorts/"]),
html.detoxify-hide-shorts ytd-compact-video-renderer:has(a[href*="/shorts/"]),
html.detoxify-hide-shorts ytd-reel-item-renderer,
html.detoxify-hide-shorts yt-lockup-view-model:has(a[href*="/shorts/"]),
html.detoxify-hide-shorts ytd-notification-renderer:has(a[href*="/shorts/"]) {
  display: none !important;
}

/* Sidebar / mini-guide Shorts entries (DOM pass also sets attr) */
html.detoxify-hide-shorts-sidebar ytd-guide-entry-renderer[data-detoxify-shorts-nav],
html.detoxify-hide-shorts-sidebar ytd-mini-guide-entry-renderer[data-detoxify-shorts-nav],
html.detoxify-hide-shorts-sidebar ytm-pivot-bar-item-renderer[data-detoxify-shorts-nav] {
  display: none !important;
}

/* Playables / games */
html.detoxify-hide-playables ytd-rich-section-renderer[data-detoxify-playables],
html.detoxify-hide-playables ytm-rich-section-renderer[data-detoxify-playables],
html.detoxify-hide-playables ytd-rich-shelf-renderer[data-detoxify-playables],
html.detoxify-hide-playables grid-shelf-view-model[data-detoxify-playables],
html.detoxify-hide-playables ytd-rich-item-renderer:has(a[href*="playables"]),
html.detoxify-hide-playables ytd-rich-item-renderer:has(a[href*="/playables"]),
html.detoxify-hide-playables yt-lockup-view-model:has(a[href*="playables"]) {
  display: none !important;
}

/* Keyword-hidden cards */
[data-detoxify-keyword="1"] {
  display: none !important;
}

/* Generic DOM-pass hide */
[data-detoxify-hidden="1"] {
  display: none !important;
}
`.trim();
}

export function ensureStyleElement() {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = buildDetoxifyCss();
    (document.head || document.documentElement).appendChild(el);
  } else if (!el.textContent) {
    el.textContent = buildDetoxifyCss();
  }
  return el;
}

/**
 * Toggle root classes on <html> from settings.
 */
export function applyRootClasses(settings) {
  const root = document.documentElement;
  root.classList.toggle("detoxify-hide-shorts", Boolean(settings.hideShorts));
  root.classList.toggle(
    "detoxify-hide-shorts-sidebar",
    Boolean(settings.hideShorts && settings.hideShortsSidebar)
  );
  root.classList.toggle(
    "detoxify-hide-playables",
    Boolean(settings.hidePlayables)
  );
  root.classList.toggle(
    "detoxify-block-keywords",
    Boolean(settings.blockKeywords)
  );
  root.classList.toggle(
    "detoxify-music-label",
    Boolean(settings.shortenMusicLabel)
  );
}
