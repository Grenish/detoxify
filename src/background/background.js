/**
 * Thin MV3 background (service worker on Chrome, scripts on Firefox).
 * Live apply is driven by chrome.storage.onChanged in the content script;
 * this worker exists for install migration hooks and future needs.
 */
import { getSettings } from "../shared/storage.js";

async function ensureMigrated() {
  try {
    await getSettings();
  } catch (err) {
    console.error("[Detoxify] background migration failed:", err);
  }
}

const api = globalThis.browser ?? globalThis.chrome;

if (api?.runtime?.onInstalled) {
  api.runtime.onInstalled.addListener(() => {
    ensureMigrated();
  });
}

ensureMigrated();
