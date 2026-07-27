import { SELECTORS } from "../../shared/selectors.js";

function textOf(el) {
  return (el?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function cardText(card) {
  const title = textOf(card.querySelector(SELECTORS.videoTitle));
  const channel = textOf(card.querySelector(SELECTORS.channelName));
  // Fallback: whole card text is noisy but useful when structure shifts
  if (!title && !channel) {
    return textOf(card).slice(0, 500);
  }
  return `${title} ${channel}`.trim();
}

/**
 * Hide feed cards whose title/channel contains a blocked keyword (substring).
 */
export function applyKeywords(settings) {
  const enabled = Boolean(settings.blockKeywords);
  const keywords = Array.isArray(settings.keywords) ? settings.keywords : [];

  const cards = document.querySelectorAll(SELECTORS.richItem);

  cards.forEach((card) => {
    // Don't re-process pure Shorts cards if already shorts-hidden
    if (card.getAttribute("data-detoxify-shorts-card") === "1") {
      card.removeAttribute("data-detoxify-keyword");
      return;
    }

    if (!enabled || keywords.length === 0) {
      if (card.getAttribute("data-detoxify-keyword") === "1") {
        card.removeAttribute("data-detoxify-keyword");
      }
      return;
    }

    const haystack = cardText(card);
    if (!haystack) return;

    const hit = keywords.some((kw) => kw && haystack.includes(kw));
    if (hit) {
      card.setAttribute("data-detoxify-keyword", "1");
    } else {
      card.removeAttribute("data-detoxify-keyword");
    }
  });
}

/** Pure helper for tests / popup preview. */
export function matchesKeywordBlocklist(title, channel, keywords) {
  const haystack = `${title || ""} ${channel || ""}`.toLowerCase();
  return keywords.some((kw) => kw && haystack.includes(String(kw).toLowerCase()));
}
