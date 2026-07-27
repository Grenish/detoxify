/** Caps to stay within chrome.storage.sync practical limits. */
export const MAX_KEYWORDS = 50;
export const MAX_CUSTOM_PRESETS = 10;
export const MAX_KEYWORD_LENGTH = 80;
export const MAX_PRESET_NAME_LENGTH = 40;

/**
 * Fresh-install defaults: everything off until the user enables
 * toggles or applies a preset.
 */
export const DEFAULT_SETTINGS = Object.freeze({
  hideShorts: false,
  hidePlayables: false,
  blockKeywords: false,
  keywords: [],
  hideShortsSidebar: false,
  shortenMusicLabel: false,
  redirectShorts: false,
  activePresetId: null,
  customPresets: [],
  /** Popup UI theme: "light" | "dark" */
  theme: "light",
  /** Schema version for future migrations */
  settingsVersion: 2,
});

/** Feature keys that make up a "profile" (saved in presets). */
export const FEATURE_KEYS = [
  "hideShorts",
  "hidePlayables",
  "blockKeywords",
  "keywords",
  "hideShortsSidebar",
  "shortenMusicLabel",
  "redirectShorts",
];
