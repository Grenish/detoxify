import { getSettings, subscribeSettings } from "../shared/storage.js";
import { applyAll } from "./apply.js";
import { createPageObserver } from "./observer.js";

let currentSettings = null;
let observer = null;

function runApply() {
  if (!currentSettings) return;
  try {
    applyAll(currentSettings);
  } catch (err) {
    console.error("[Detoxify] apply failed:", err);
  }
}

function startObserver() {
  if (observer) return;
  observer = createPageObserver(() => runApply());
  observer.start();
}

async function init() {
  try {
    // Live updates + initial load
    subscribeSettings((settings) => {
      currentSettings = settings;
      runApply();
      startObserver();
    });
  } catch (err) {
    console.error("[Detoxify] init failed:", err);
  }
}

// Early redirect before full init when possible
getSettings()
  .then((settings) => {
    currentSettings = settings;
    if (settings.hideShorts && settings.redirectShorts) {
      const path = location.pathname || "";
      if (path === "/shorts" || path.startsWith("/shorts/")) {
        location.replace("https://www.youtube.com/");
      }
    }
  })
  .catch(() => {});

// document_start: wait for DOM for observers / hiding
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
