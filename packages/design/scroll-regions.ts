/**
 * Regions that scroll sideways (wide tables, long code lines) must be
 * reachable by keyboard. Only regions that actually overflow get a tab stop,
 * a region role and a label; they lose them again when they fit.
 * `data-scroll-label` overrides the default label.
 */
const SELECTOR = ".table-block, .block pre, [data-scroll-region]";
const MARK = "data-scroll-focus";

function defaultLabel(region: HTMLElement) {
  if (region.dataset.scrollLabel) return region.dataset.scrollLabel;
  return region.matches("pre")
    ? "Code, scrolls sideways"
    : "Table, scrolls sideways";
}

export function updateScrollRegion(region: HTMLElement) {
  const scrolls = region.scrollWidth > region.clientWidth + 1;
  const marked = region.hasAttribute(MARK);
  if (scrolls && !marked && !region.hasAttribute("tabindex")) {
    region.setAttribute(MARK, "");
    region.tabIndex = 0;
    region.setAttribute("role", "region");
    region.setAttribute("aria-label", defaultLabel(region));
  } else if (!scrolls && marked) {
    region.removeAttribute(MARK);
    region.removeAttribute("tabindex");
    region.removeAttribute("role");
    region.removeAttribute("aria-label");
  }
}

export function attachScrollRegions() {
  const update = () =>
    document
      .querySelectorAll<HTMLElement>(SELECTOR)
      .forEach(updateScrollRegion);
  update();
  // Regions change width with the window and appear or grow with client-side
  // navigation and lab bench output.
  window.addEventListener("resize", update, { passive: true });
  const mutations = new MutationObserver(update);
  mutations.observe(document.body, { childList: true, subtree: true });
  return () => {
    window.removeEventListener("resize", update);
    mutations.disconnect();
  };
}
