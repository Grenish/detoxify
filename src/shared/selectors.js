/**
 * Central YouTube DOM selectors.
 * Prefer href / structure over volatile class names.
 * Update this file when YouTube breaks hides.
 */

export const STYLE_ID = "detoxify-style";
export const HIDDEN_ATTR = "data-detoxify-hidden";
export const KEYWORD_HIDDEN_ATTR = "data-detoxify-keyword";
export const MUSIC_ATTR = "data-detoxify-music";

/** Shelf / section titles we treat as Shorts. */
export const SHORTS_TITLES = ["shorts", "short"];

/** Playables / games shelf titles. */
export const PLAYABLES_TITLES = [
  "playables",
  "youtube playables",
  "games",
  "gaming",
];

export const SELECTORS = {
  // Shelves
  richSection: "ytd-rich-section-renderer, ytm-rich-section-renderer",
  reelShelf:
    "ytd-reel-shelf-renderer, ytm-reel-shelf-renderer, ytd-rich-shelf-renderer",
  gridShelf: "grid-shelf-view-model, ytd-shelf-renderer",

  // Cards / items
  richItem:
    "ytd-rich-item-renderer, ytm-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-reel-item-renderer",
  lockup: "yt-lockup-view-model, ytd-rich-grid-media",

  // Links
  shortsLink: 'a[href*="/shorts/"]',
  playablesLink:
    'a[href*="playables"], a[href*="/playables"], a[href*="gaming.youtube.com"]',

  // Guide / sidebar
  guideEntry:
    "ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytm-pivot-bar-item-renderer",
  guideTitle:
    "#endpoint yt-formatted-string, .title, span.title, yt-formatted-string.title",

  // Channel tabs
  tab: "yt-tab-shape, tp-yt-paper-tab, ytd-tabbed-header-renderer tp-yt-paper-tab",

  // Title / channel on cards
  videoTitle:
    "#video-title, #video-title-link, a#video-title, .yt-lockup-metadata-view-model__title, h3 a, #video-title yt-formatted-string",
  channelName:
    "ytd-channel-name #text, #channel-name #text, .yt-lockup-metadata-view-model__metadata a, #text.ytd-channel-name, ytd-channel-name yt-formatted-string",

  // Section title inside rich sections
  sectionTitle:
    "#title-text, #title, h2 #title, .shelf-title-text, span#title, h2.ytd-rich-shelf-renderer, h2 yt-formatted-string",
};
