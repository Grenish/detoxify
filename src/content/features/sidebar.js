import { SELECTORS } from "../../shared/selectors.js";

function textOf(el) {
  return (el?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function isShortsNav(entry) {
  if (entry.getAttribute("aria-label")?.toLowerCase() === "shorts") return true;

  const href =
    entry.querySelector("a#endpoint, a.yt-simple-endpoint, a")?.getAttribute(
      "href"
    ) || "";
  if (href === "/shorts" || href.startsWith("/shorts?")) return true;

  const title = textOf(entry.querySelector(SELECTORS.guideTitle) || entry);
  return title === "shorts";
}

/**
 * Mark guide / mini-guide / mobile pivot entries for Shorts.
 */
export function applyShortsSidebar(settings) {
  const hide = Boolean(settings.hideShorts && settings.hideShortsSidebar);
  const entries = document.querySelectorAll(SELECTORS.guideEntry);

  entries.forEach((entry) => {
    if (isShortsNav(entry)) {
      if (hide) {
        entry.setAttribute("data-detoxify-shorts-nav", "1");
      } else {
        entry.removeAttribute("data-detoxify-shorts-nav");
      }
    }
  });

  // Channel / header Shorts tab
  document.querySelectorAll(SELECTORS.tab).forEach((tab) => {
    const label = textOf(tab);
    if (label === "shorts" || label.includes("shorts")) {
      if (hide) {
        tab.setAttribute("data-detoxify-shorts-nav", "1");
        tab.setAttribute("data-detoxify-hidden", "1");
      } else if (tab.getAttribute("data-detoxify-shorts-nav") === "1") {
        tab.removeAttribute("data-detoxify-shorts-nav");
        tab.removeAttribute("data-detoxify-hidden");
      }
    }
  });
}
