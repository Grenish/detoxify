import {
  PLAYABLES_TITLES,
  SELECTORS,
  SHORTS_TITLES,
} from "../../shared/selectors.js";

function textOf(el) {
  return (el?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function titleLooksLikeShorts(title) {
  if (!title) return false;
  return SHORTS_TITLES.some(
    (t) => title === t || title.startsWith(`${t} `) || title.endsWith(` ${t}`)
  );
}

function sectionTitle(section) {
  const titleEl = section.querySelector(SELECTORS.sectionTitle);
  return textOf(titleEl);
}

/**
 * Mark / unmark shelf sections that are Shorts rails.
 */
export function applyShortsShelves(settings) {
  const hide = Boolean(settings.hideShorts);
  const sections = document.querySelectorAll(
    `${SELECTORS.richSection}, ${SELECTORS.reelShelf}, ${SELECTORS.gridShelf}`
  );

  sections.forEach((section) => {
    const title = sectionTitle(section);
    const hasShortsLink = Boolean(section.querySelector(SELECTORS.shortsLink));
    const isShortsShelf =
      titleLooksLikeShorts(title) ||
      (hasShortsLink &&
        !PLAYABLES_TITLES.some((t) => title === t || title.includes(t)));

    // reel-shelf is almost always Shorts
    const isReel =
      section.tagName?.toLowerCase().includes("reel-shelf") ||
      section.localName?.includes("reel-shelf");

    if (hide && (isShortsShelf || isReel || titleLooksLikeShorts(title))) {
      // Prefer not marking pure playables sections as shorts
      if (PLAYABLES_TITLES.some((t) => title === t || title.includes(t))) {
        return;
      }
      section.setAttribute("data-detoxify-hidden", "1");
      section.setAttribute("data-detoxify-shorts-shelf", "1");
    } else if (section.getAttribute("data-detoxify-shorts-shelf") === "1") {
      section.removeAttribute("data-detoxify-hidden");
      section.removeAttribute("data-detoxify-shorts-shelf");
    }
  });
}

/**
 * Hide individual feed cards that link to /shorts/.
 * CSS :has() covers modern browsers; this is a fallback + attr for older.
 */
export function applyShortsCards(settings) {
  const hide = Boolean(settings.hideShorts);
  const cards = document.querySelectorAll(SELECTORS.richItem);

  cards.forEach((card) => {
    const isShort = Boolean(card.querySelector(SELECTORS.shortsLink));
    if (hide && isShort) {
      card.setAttribute("data-detoxify-hidden", "1");
      card.setAttribute("data-detoxify-shorts-card", "1");
    } else if (card.getAttribute("data-detoxify-shorts-card") === "1") {
      card.removeAttribute("data-detoxify-hidden");
      card.removeAttribute("data-detoxify-shorts-card");
    }
  });
}

export function applyShorts(settings) {
  applyShortsShelves(settings);
  applyShortsCards(settings);
}
