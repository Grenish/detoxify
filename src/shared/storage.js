import { api, storageGet, storageSet } from "./api.js";
import {
  DEFAULT_SETTINGS,
  FEATURE_KEYS,
  MAX_CUSTOM_PRESETS,
  MAX_KEYWORD_LENGTH,
  MAX_KEYWORDS,
  MAX_PRESET_NAME_LENGTH,
} from "./defaults.js";
import {
  createCustomPresetId,
  featuresMatch,
  pickFeatureSettings,
  resolvePresetSettings,
} from "./presets.js";

function clampString(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function normalizeKeywords(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of input) {
    const kw = clampString(raw, MAX_KEYWORD_LENGTH).toLowerCase();
    if (!kw || seen.has(kw)) continue;
    seen.add(kw);
    out.push(kw);
    if (out.length >= MAX_KEYWORDS) break;
  }
  return out;
}

function normalizeCustomPresets(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const id = clampString(raw.id, 80);
    const name = clampString(raw.name, MAX_PRESET_NAME_LENGTH);
    if (!id.startsWith("custom:") || !name) continue;
    const settings = normalizeFeatureSettings(raw.settings ?? {});
    out.push({ id, name, settings });
    if (out.length >= MAX_CUSTOM_PRESETS) break;
  }
  return out;
}

function normalizeFeatureSettings(raw) {
  return {
    hideShorts: Boolean(raw.hideShorts),
    hidePlayables: Boolean(raw.hidePlayables),
    blockKeywords: Boolean(raw.blockKeywords),
    keywords: normalizeKeywords(raw.keywords),
    hideShortsSidebar: Boolean(raw.hideShortsSidebar),
    shortenMusicLabel: Boolean(raw.shortenMusicLabel),
    redirectShorts: Boolean(raw.redirectShorts),
  };
}

/**
 * Normalize raw storage into the v2 settings object.
 * Migrates legacy `{ hideShorts: boolean }` installs.
 */
export function normalizeSettings(raw = {}) {
  const isLegacyOnly =
    raw.settingsVersion == null &&
    typeof raw.hideShorts === "boolean" &&
    raw.hidePlayables === undefined &&
    raw.blockKeywords === undefined;

  const theme = raw.theme === "dark" ? "dark" : "light";

  const base = {
    ...DEFAULT_SETTINGS,
    ...normalizeFeatureSettings(raw),
    activePresetId:
      raw.activePresetId === null || raw.activePresetId === undefined
        ? null
        : clampString(raw.activePresetId, 80) || null,
    customPresets: normalizeCustomPresets(raw.customPresets),
    theme,
    settingsVersion: 2,
  };

  if (isLegacyOnly && raw.hideShorts) {
    base.hideShorts = true;
    base.hideShortsSidebar = true;
  }

  return base;
}

export async function getSettings() {
  const raw = await storageGet(null);
  const settings = normalizeSettings(raw ?? {});

  if (raw?.settingsVersion !== 2) {
    await storageSet(settings);
  }

  return settings;
}

export async function saveSettings(partial) {
  const current = await getSettings();
  const merged = normalizeSettings({ ...current, ...partial });

  // Editing features invalidates active preset unless still an exact match
  if (FEATURE_KEYS.some((k) => Object.prototype.hasOwnProperty.call(partial, k))) {
    if (merged.activePresetId) {
      const presetSettings = resolvePresetSettings(
        merged.activePresetId,
        merged.customPresets
      );
      if (
        !presetSettings ||
        !featuresMatch(pickFeatureSettings(merged), {
          ...presetSettings,
          // Built-ins often ship empty keywords; compare keywords only when
          // the preset itself defines a non-empty list.
          keywords:
            presetSettings.keywords?.length > 0
              ? presetSettings.keywords
              : merged.keywords,
        })
      ) {
        merged.activePresetId = null;
      }
    }
  }

  await storageSet(merged);
  return merged;
}

export async function applyPreset(presetId) {
  const current = await getSettings();
  const featureSettings = resolvePresetSettings(
    presetId,
    current.customPresets
  );
  if (!featureSettings) {
    throw new Error(`Unknown preset: ${presetId}`);
  }

  // Keep the user's keyword list when applying presets that enable blocklist
  // with an empty keyword array (built-ins).
  const keywords =
    featureSettings.keywords?.length > 0
      ? featureSettings.keywords
      : current.keywords;

  const merged = normalizeSettings({
    ...current,
    ...featureSettings,
    keywords,
    activePresetId: presetId,
  });

  await storageSet(merged);
  return merged;
}

export async function saveCustomPreset(name) {
  const current = await getSettings();
  if (current.customPresets.length >= MAX_CUSTOM_PRESETS) {
    throw new Error(`At most ${MAX_CUSTOM_PRESETS} custom presets.`);
  }

  const id = createCustomPresetId();
  const preset = {
    id,
    name: clampString(name, MAX_PRESET_NAME_LENGTH),
    settings: pickFeatureSettings(current),
  };
  if (!preset.name) throw new Error("Preset name is required.");

  const customPresets = [...current.customPresets, preset];
  const merged = normalizeSettings({
    ...current,
    customPresets,
    activePresetId: id,
  });
  await storageSet(merged);
  return merged;
}

export async function deleteCustomPreset(id) {
  const current = await getSettings();
  const customPresets = current.customPresets.filter((p) => p.id !== id);
  const activePresetId =
    current.activePresetId === id ? null : current.activePresetId;
  const merged = normalizeSettings({
    ...current,
    customPresets,
    activePresetId,
  });
  await storageSet(merged);
  return merged;
}

export function subscribeSettings(callback) {
  getSettings().then(callback).catch(console.error);

  if (!api?.storage?.onChanged) {
    return () => {};
  }

  const handler = (changes, area) => {
    if (area !== "sync") return;
    getSettings().then(callback).catch(console.error);
  };
  api.storage.onChanged.addListener(handler);
  return () => api.storage.onChanged.removeListener(handler);
}
