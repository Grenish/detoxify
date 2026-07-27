import { MUSIC_ATTR, SELECTORS } from "../../shared/selectors.js";

function textOf(el) {
  return (el?.textContent || "").replace(/\s+/g, " ").trim();
}

/**
 * Shorten "YouTube Music" → "Music" on guide entries when enabled.
 * Restores original label when disabled.
 */
export function applyMusicLabel(settings) {
  const enabled = Boolean(settings.shortenMusicLabel);
  const entries = document.querySelectorAll(SELECTORS.guideEntry);

  entries.forEach((entry) => {
    const labelEl =
      entry.querySelector(SELECTORS.guideTitle) ||
      entry.querySelector("yt-formatted-string");
    if (!labelEl) return;

    const current = textOf(labelEl);
    const lower = current.toLowerCase();
    const isMusic =
      lower === "youtube music" ||
      lower === "music" ||
      entry.getAttribute(MUSIC_ATTR) === "1";

    if (!isMusic) return;

    if (enabled) {
      if (!entry.getAttribute("data-detoxify-music-original")) {
        entry.setAttribute(
          "data-detoxify-music-original",
          current || "YouTube Music"
        );
      }
      entry.setAttribute(MUSIC_ATTR, "1");
      if (lower === "youtube music" || lower.includes("youtube music")) {
        if ("innerText" in labelEl) labelEl.innerText = "Music";
        else labelEl.textContent = "Music";
      }
    } else if (entry.getAttribute(MUSIC_ATTR) === "1") {
      const original =
        entry.getAttribute("data-detoxify-music-original") || "YouTube Music";
      if ("innerText" in labelEl) labelEl.innerText = original;
      else labelEl.textContent = original;
      entry.removeAttribute(MUSIC_ATTR);
      entry.removeAttribute("data-detoxify-music-original");
    }
  });
}
