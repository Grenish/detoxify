import { FEATURE_KEYS } from "./defaults.js";

/**
 * Built-in presets. Soft: gentle hide without redirect.
 * Balanced: core detox. Max focus: everything including keywords on.
 */
export const BUILTIN_PRESETS = Object.freeze([
  Object.freeze({
    id: "soft",
    name: "Soft",
    description: "Hide Shorts shelves and cards only.",
    settings: Object.freeze({
      hideShorts: true,
      hidePlayables: false,
      blockKeywords: false,
      keywords: [],
      hideShortsSidebar: true,
      shortenMusicLabel: false,
      redirectShorts: false,
    }),
  }),
  Object.freeze({
    id: "balanced",
    name: "Balanced",
    description: "Shorts + Playables + sidebar + Shorts redirect.",
    settings: Object.freeze({
      hideShorts: true,
      hidePlayables: true,
      blockKeywords: false,
      keywords: [],
      hideShortsSidebar: true,
      shortenMusicLabel: false,
      redirectShorts: true,
    }),
  }),
  Object.freeze({
    id: "max-focus",
    name: "Max focus",
    description: "Full detox, keyword filter on, Music label polish.",
    settings: Object.freeze({
      hideShorts: true,
      hidePlayables: true,
      blockKeywords: true,
      keywords: [],
      hideShortsSidebar: true,
      shortenMusicLabel: true,
      redirectShorts: true,
    }),
  }),
]);

export function getBuiltinPreset(id) {
  return BUILTIN_PRESETS.find((p) => p.id === id) ?? null;
}

export function pickFeatureSettings(settings) {
  const out = {};
  for (const key of FEATURE_KEYS) {
    out[key] = settings[key];
  }
  return out;
}

export function featuresMatch(a, b) {
  for (const key of FEATURE_KEYS) {
    if (key === "keywords") {
      const ka = Array.isArray(a.keywords) ? a.keywords : [];
      const kb = Array.isArray(b.keywords) ? b.keywords : [];
      if (ka.length !== kb.length) return false;
      for (let i = 0; i < ka.length; i++) {
        if (ka[i] !== kb[i]) return false;
      }
      continue;
    }
    if (Boolean(a[key]) !== Boolean(b[key])) return false;
  }
  return true;
}

export function createCustomPresetId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `custom:${crypto.randomUUID()}`;
  }
  return `custom:${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function resolvePresetSettings(presetId, customPresets = []) {
  if (!presetId) return null;
  const builtin = getBuiltinPreset(presetId);
  if (builtin) return { ...builtin.settings };
  const custom = customPresets.find((p) => p.id === presetId);
  if (custom?.settings) return { ...custom.settings };
  return null;
}
