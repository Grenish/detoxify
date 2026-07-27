import { applyRootClasses, ensureStyleElement } from "../shared/css.js";
import { applyKeywords } from "./features/keywords.js";
import { applyMusicLabel } from "./features/musicLabel.js";
import { applyPlayables } from "./features/playables.js";
import { applyShorts } from "./features/shorts.js";
import { applyShortsRedirect } from "./features/shortsRedirect.js";
import { applyShortsSidebar } from "./features/sidebar.js";

/**
 * Apply all detox features for the current settings snapshot.
 */
export function applyAll(settings) {
  ensureStyleElement();
  applyRootClasses(settings);
  applyShortsRedirect(settings);
  applyShorts(settings);
  applyShortsSidebar(settings);
  applyPlayables(settings);
  applyKeywords(settings);
  applyMusicLabel(settings);
}
