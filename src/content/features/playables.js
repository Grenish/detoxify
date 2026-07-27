import { PLAYABLES_TITLES, SELECTORS } from "../../shared/selectors.js";

function textOf(el) {
  return (el?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function sectionTitle(section) {
  const titleEl = section.querySelector(SELECTORS.sectionTitle);
  return textOf(titleEl);
}

function isPlayablesTitle(title) {
  if (!title) return false;
  return PLAYABLES_TITLES.some(
    (t) => title === t || title.includes(t)
  );
}

function hasPlayablesLink(el) {
  return Boolean(
    el.querySelector(
      'a[href*="playables"], a[href*="/playables"], a[href*="://www.youtube.com/playables"]'
    )
  );
}

/**
 * Hide Playables / Games shelves and promo units.
 */
export function applyPlayables(settings) {
  const hide = Boolean(settings.hidePlayables);
  const sections = document.querySelectorAll(
    `${SELECTORS.richSection}, ${SELECTORS.reelShelf}, ${SELECTORS.gridShelf}, ytd-shelf-renderer`
  );

  sections.forEach((section) => {
    const title = sectionTitle(section);
    const match =
      isPlayablesTitle(title) ||
      hasPlayablesLink(section) ||
      textOf(section).includes("youtube playables");

    // Avoid tagging pure Shorts shelves
    const looksShorts =
      title === "shorts" ||
      section.localName?.includes("reel-shelf") ||
      (section.querySelector('a[href*="/shorts/"]') &&
        !isPlayablesTitle(title) &&
        !hasPlayablesLink(section));

    if (hide && match && !looksShorts) {
      section.setAttribute("data-detoxify-playables", "1");
      section.setAttribute("data-detoxify-hidden", "1");
    } else if (section.getAttribute("data-detoxify-playables") === "1") {
      section.removeAttribute("data-detoxify-playables");
      section.removeAttribute("data-detoxify-hidden");
    }
  });
}
