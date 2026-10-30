/**
 * Scroll behavior shared by every page: the reading progress bar
 * (`[data-reading-progress]`, drives `--progress`) and the "on this page"
 * list (marks the link of the section being read with `.is-current`).
 */

import { LOCALE_IDS } from "../../site/locales";
import { catalogFor } from "./catalog";

/** "On this page" is named in the page's language: match the name of every locale. */
const TOC_LINKS = LOCALE_IDS.map(
  (locale) =>
    `nav[aria-label="${catalogFor(locale).shell.onThisPageAria}"] a[href^="#"]`,
).join(", ");

function updateProgress() {
  const bar = document.querySelector<HTMLElement>("[data-reading-progress]");
  if (!bar) return;
  const remaining = document.documentElement.scrollHeight - window.innerHeight;
  const value = remaining > 0 ? Math.min(1, window.scrollY / remaining) : 1;
  bar.style.setProperty("--progress", String(value));
}

function updateToc() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>(TOC_LINKS)];
  let current: HTMLAnchorElement | undefined;
  for (const link of links) {
    const target = document.getElementById(
      decodeURIComponent(link.hash.slice(1)),
    );
    if (target && target.getBoundingClientRect().top <= 120) current = link;
  }
  current ??= links[0];
  for (const link of links) {
    link.classList.toggle("is-current", link === current);
  }
}

export function attachScroll() {
  const update = () => {
    updateProgress();
    updateToc();
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  // A client-side navigation swaps the page: measure the new one.
  const observer = new MutationObserver(update);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
    observer.disconnect();
  };
}
