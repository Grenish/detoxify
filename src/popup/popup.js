import { BUILTIN_PRESETS } from "../shared/presets.js";
import { DEFAULT_SETTINGS, MAX_KEYWORDS } from "../shared/defaults.js";
import {
  applyPreset,
  deleteCustomPreset,
  getSettings,
  saveCustomPreset,
  saveSettings,
} from "../shared/storage.js";

const FEATURE_CHECKBOX_KEYS = [
  "hideShorts",
  "hidePlayables",
  "blockKeywords",
  "hideShortsSidebar",
  "shortenMusicLabel",
  "redirectShorts",
];

const PRESET_ICONS = {
  soft: "S",
  balanced: "B",
  "max-focus": "M",
};

const PRESET_BLURBS = {
  soft: "Shorts only",
  balanced: "Core detox",
  "max-focus": "Everything on",
};

const STORE_URLS = {
  chrome:
    "https://chromewebstore.google.com/detail/detoxify/fpkgobnjbinhnnhbbjagohcohhlbghig",
  firefox: "https://addons.mozilla.org/en-US/firefox/addon/detoxify-youtube/",
};

let settings = null;
let rendering = false;
let flashTimer = null;
let currentView = "main";

const $ = (id) => document.getElementById(id);

function anyFeatureOn(s) {
  return FEATURE_CHECKBOX_KEYS.some((k) => Boolean(s?.[k]));
}

function detectStore() {
  // Prefer userAgent: browser.runtime.getBrowserInfo is async
  const ua = navigator.userAgent || "";
  if (/Firefox\//i.test(ua)) return "firefox";
  return "chrome";
}

function resolveMode(s) {
  if (!s) return { mode: "off", label: "OFF" };

  if (s.activePresetId) {
    const builtin = BUILTIN_PRESETS.find((p) => p.id === s.activePresetId);
    if (builtin) {
      return {
        mode: builtin.id === "max-focus" ? "max-focus" : builtin.id,
        label: builtin.name.toUpperCase(),
      };
    }
    const custom = (s.customPresets || []).find(
      (p) => p.id === s.activePresetId
    );
    if (custom) {
      const name = custom.name.toUpperCase();
      return {
        mode: "custom",
        label: name.length > 10 ? `${name.slice(0, 9)}…` : name,
      };
    }
  }

  if (anyFeatureOn(s)) {
    return { mode: "custom", label: "CUSTOM" };
  }

  return { mode: "off", label: "OFF" };
}

function showFlash(message, view = currentView) {
  const el = view === "settings" ? $("flash-settings") : $("flash");
  // Also clear the other flash so height doesn't stack
  const other = view === "settings" ? $("flash") : $("flash-settings");
  if (other) other.hidden = true;

  if (!el) return;
  el.hidden = false;
  el.textContent = String(message).toUpperCase();
  requestAnimationFrame(() => resizePopup());
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    el.hidden = true;
    requestAnimationFrame(() => resizePopup());
  }, 2200);
}

function applyTheme(theme) {
  const value = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = value;
}

function updateThemeButtons() {
  const theme = settings?.theme === "dark" ? "dark" : "light";
  document.querySelectorAll("[data-theme-value]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeValue === theme);
  });
}

function showView(name) {
  currentView = name;
  const main = $("view-main");
  const settingsView = $("view-settings");
  if (main) main.hidden = name !== "main";
  if (settingsView) settingsView.hidden = name !== "settings";

  // Hide flashes when switching
  if ($("flash")) $("flash").hidden = true;
  if ($("flash-settings")) $("flash-settings").hidden = true;

  // Double rAF: wait for [hidden] layout, then size panel (esp. Firefox)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      resizePopup();
    });
  });
}

function updateStatusPill() {
  const pill = $("status-pill");
  const label = $("status-label");
  if (!pill || !label || !settings) return;

  const { mode, label: text } = resolveMode(settings);
  pill.dataset.mode = mode;
  label.textContent = text;

  const power = $("power-btn");
  if (power) {
    const on = anyFeatureOn(settings);
    power.disabled = !on;
    power.title = on
      ? "Turn all detox features off"
      : "Everything is already off";
  }
}

function setNestedVisibility() {
  const shortsOn = Boolean(settings?.hideShorts);
  const nest = $("shorts-nested");
  if (nest) nest.classList.toggle("open", shortsOn);

  for (const id of ["row-redirectShorts", "row-hideShortsSidebar"]) {
    const row = $(id);
    if (!row) continue;
    const input = row.querySelector("input");
    if (input) input.disabled = !shortsOn;
  }

  const keywords = $("keywords-section");
  if (keywords) {
    keywords.classList.toggle("open", Boolean(settings?.blockKeywords));
  }
}

function renderPresets() {
  const row = $("preset-row");
  if (!row) return;
  row.innerHTML = "";

  for (const preset of BUILTIN_PRESETS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset-tile";
    btn.dataset.id = preset.id;
    btn.role = "listitem";
    btn.title = preset.description;
    if (settings?.activePresetId === preset.id) {
      btn.classList.add("active");
    }

    const icon = document.createElement("span");
    icon.className = "preset-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = PRESET_ICONS[preset.id] || preset.name[0];

    const name = document.createElement("span");
    name.className = "preset-name";
    name.textContent = preset.name;

    const blurb = document.createElement("span");
    blurb.className = "preset-blurb";
    blurb.textContent = PRESET_BLURBS[preset.id] || preset.description;

    btn.append(icon, name, blurb);
    btn.addEventListener("click", async () => {
      try {
        settings = await applyPreset(preset.id);
        render();
        showFlash(`${preset.name} applied — live`, "main");
      } catch (err) {
        console.error(err);
        showFlash(err.message || "Could not apply preset.", "main");
      }
    });
    row.appendChild(btn);
  }

  const customWrap = $("custom-presets");
  if (!customWrap) return;
  const customs = settings?.customPresets || [];
  customWrap.hidden = customs.length === 0;
  customWrap.innerHTML = "";

  for (const preset of customs) {
    const item = document.createElement("div");
    item.className = "custom-preset";
    if (settings?.activePresetId === preset.id) item.classList.add("active");

    const name = document.createElement("span");
    name.textContent = preset.name;

    const applyBtn = document.createElement("button");
    applyBtn.type = "button";
    applyBtn.className = "btn small";
    applyBtn.textContent = "Apply";
    applyBtn.addEventListener("click", async () => {
      settings = await applyPreset(preset.id);
      render();
      showFlash(`${preset.name} applied — live`, "main");
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn danger small";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      if (!confirm(`Delete preset “${preset.name}”?`)) return;
      settings = await deleteCustomPreset(preset.id);
      render();
      showFlash("Preset deleted", "main");
    });

    item.append(name, applyBtn, delBtn);
    customWrap.appendChild(item);
  }
}

function renderToggles() {
  for (const key of FEATURE_CHECKBOX_KEYS) {
    const input = $(key);
    if (!input || !settings) continue;
    input.checked = Boolean(settings[key]);
  }
  setNestedVisibility();
}

function renderKeywords() {
  const list = $("keyword-list");
  const count = $("keyword-count");
  if (!list || !settings) return;

  const keywords = settings.keywords || [];
  if (count) count.textContent = `${keywords.length} / ${MAX_KEYWORDS}`;

  list.innerHTML = "";
  for (const kw of keywords) {
    const li = document.createElement("li");
    li.className = "keyword-chip";
    const label = document.createElement("span");
    label.textContent = kw;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${kw}`);
    remove.textContent = "×";
    remove.addEventListener("click", async () => {
      const next = keywords.filter((k) => k !== kw);
      settings = await saveSettings({ keywords: next });
      render();
    });
    li.append(label, remove);
    list.appendChild(li);
  }
}

function wireRateLink() {
  const link = $("rate-link");
  if (!link) return;
  const store = detectStore();
  link.href = STORE_URLS[store];
  link.title =
    store === "firefox" ? "Rate on Firefox Add-ons" : "Rate on Chrome Web Store";
}

/**
 * Size the popup to the active view.
 * Firefox often keeps the previous panel height when switching views and
 * refuses to scroll if html/body used overflow:hidden — we measure the
 * visible view and set an explicit height, with a scroll fallback.
 */
function resizePopup() {
  const view =
    currentView === "settings" ? $("view-settings") : $("view-main");
  if (!view) return;

  // Clear previous locks
  document.documentElement.style.height = "";
  document.body.style.height = "";
  document.documentElement.classList.remove("popup-hug");

  // Force layout with the active view only
  void view.offsetHeight;

  const contentHeight = Math.ceil(view.getBoundingClientRect().height);
  const cap = 600;
  const needsScroll = contentHeight > cap;
  const applied = needsScroll ? cap : contentHeight;

  // Explicit px height helps Firefox open the panel to the right size
  document.documentElement.style.height = `${applied}px`;
  document.body.style.height = `${applied}px`;

  if (!needsScroll) {
    document.documentElement.classList.add("popup-hug");
    document.body.style.overflowY = "visible";
  } else {
    document.body.style.overflowY = "auto";
  }
}

function render() {
  if (rendering) return;
  rendering = true;
  try {
    applyTheme(settings?.theme);
    updateThemeButtons();
    renderPresets();
    renderToggles();
    renderKeywords();
    updateStatusPill();
  } finally {
    rendering = false;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      resizePopup();
    });
  });
}

async function onToggleChange(event) {
  const input = event.target;
  const key = input.dataset.key;
  if (!key) return;

  try {
    settings = await saveSettings({ [key]: input.checked });
    render();
  } catch (err) {
    console.error(err);
    input.checked = !input.checked;
    showFlash("Could not save setting", "main");
  }
}

function wireToggles() {
  for (const key of FEATURE_CHECKBOX_KEYS) {
    const input = $(key);
    if (!input) continue;
    input.addEventListener("change", onToggleChange);
  }
}

function wireKeywords() {
  const form = $("keyword-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = $("keyword-input");
    const value = (input?.value || "").trim();
    if (!value) return;

    const keywords = [...(settings.keywords || [])];
    const normalized = value.toLowerCase();
    if (!keywords.includes(normalized)) {
      if (keywords.length >= MAX_KEYWORDS) {
        showFlash(`Maximum ${MAX_KEYWORDS} keywords`, "main");
        return;
      }
      keywords.push(normalized);
    }

    try {
      settings = await saveSettings({
        keywords,
        blockKeywords: true,
      });
      if (input) input.value = "";
      render();
      showFlash("Keyword added", "main");
    } catch (err) {
      console.error(err);
      showFlash(err.message || "Could not save keyword", "main");
    }
  });
}

function wirePresetSave() {
  const openBtn = $("save-preset-btn");
  const dialog = $("save-dialog");
  const form = $("save-form");
  const cancel = $("save-cancel");
  const nameInput = $("preset-name-input");

  openBtn?.addEventListener("click", () => {
    if (nameInput) nameInput.value = "";
    dialog?.showModal();
    nameInput?.focus();
  });

  cancel?.addEventListener("click", () => dialog?.close());

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (nameInput?.value || "").trim();
    if (!name) return;
    try {
      settings = await saveCustomPreset(name);
      dialog?.close();
      render();
      showFlash(`Saved “${name}”`, "main");
    } catch (err) {
      showFlash(err.message || "Could not save preset", "main");
    }
  });
}

function wirePower() {
  $("power-btn")?.addEventListener("click", async () => {
    if (!settings || !anyFeatureOn(settings)) return;
    try {
      settings = await saveSettings({
        hideShorts: false,
        hidePlayables: false,
        blockKeywords: false,
        hideShortsSidebar: false,
        shortenMusicLabel: false,
        redirectShorts: false,
        activePresetId: null,
      });
      render();
      showFlash("All features off", "main");
    } catch (err) {
      console.error(err);
      showFlash("Could not turn off", "main");
    }
  });
}

function wireNavigation() {
  $("open-settings")?.addEventListener("click", () => showView("settings"));
  $("back-main")?.addEventListener("click", () => showView("main"));
}

function wireTheme() {
  document.querySelectorAll("[data-theme-value]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const theme = btn.dataset.themeValue === "dark" ? "dark" : "light";
      try {
        settings = await saveSettings({ theme });
        render();
        showFlash(`${theme} theme`, "settings");
      } catch (err) {
        console.error(err);
        showFlash("Could not save theme", "settings");
      }
    });
  });
}

function wireDataActions() {
  $("reset-features")?.addEventListener("click", async () => {
    if (!confirm("Turn all features off? Keywords and presets stay.")) return;
    try {
      settings = await saveSettings({
        hideShorts: false,
        hidePlayables: false,
        blockKeywords: false,
        hideShortsSidebar: false,
        shortenMusicLabel: false,
        redirectShorts: false,
        activePresetId: null,
      });
      render();
      showFlash("Features reset", "settings");
    } catch (err) {
      console.error(err);
      showFlash("Reset failed", "settings");
    }
  });

  $("reset-all")?.addEventListener("click", async () => {
    if (
      !confirm(
        "Wipe all Detoxify data? This clears toggles, keywords, and custom presets."
      )
    ) {
      return;
    }
    try {
      const theme = settings?.theme === "dark" ? "dark" : "light";
      settings = await saveSettings({
        ...DEFAULT_SETTINGS,
        theme,
        keywords: [],
        customPresets: [],
        activePresetId: null,
      });
      render();
      showFlash("All data wiped", "settings");
    } catch (err) {
      console.error(err);
      showFlash("Wipe failed", "settings");
    }
  });
}

async function init() {
  wireToggles();
  wireKeywords();
  wirePresetSave();
  wirePower();
  wireNavigation();
  wireTheme();
  wireDataActions();
  wireRateLink();

  // Recalculate if fonts/layout settle late
  window.addEventListener("resize", () => resizePopup());

  try {
    settings = await getSettings();
    applyTheme(settings.theme);
    showView("main");
    render();
  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML(
      "beforeend",
      `<p style="padding:12px;color:#ff3d00;font-family:monospace">Failed to load settings.</p>`
    );
  }
}

document.addEventListener("DOMContentLoaded", init);
