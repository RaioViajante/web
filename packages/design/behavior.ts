/**
 * The one client script every page runs: sound toggle and preference, soft
 * block behavior (copy, tabs, collapse), keyboard access to sideways
 * scrolling regions, and the 404 requested path.
 *
 * Astro:  <script>import { startBehavior } from "@raioviajante/design/behavior"; startBehavior();</script>
 * Next.js: render <Behavior /> from "@raioviajante/design/behavior-react" once in the layout.
 */
import { attachAvatarCoin } from "./avatar-coin";
import { attachBlocks } from "./blocks/client";
import { initSound } from "./sound/init";
import { attachScroll } from "./scroll";
import { attachScrollRegions } from "./scroll-regions";
import { attachSearch } from "./search/client";
import { initOwnerClock, updateOwnerClocks } from "./clock";

function fillRequestedPath() {
  document
    .querySelectorAll<HTMLElement>("[data-requested-path]")
    .forEach((node) => {
      if (node.textContent !== window.location.pathname)
        node.textContent = window.location.pathname;
    });
}

function refreshPageState() {
  fillRequestedPath();
  updateOwnerClocks();
}

export function startBehavior() {
  const stops = [
    initSound(),
    attachBlocks(),
    attachSearch(),
    attachScroll(),
    attachScrollRegions(),
    attachAvatarCoin(),
    initOwnerClock(),
  ];
  refreshPageState();
  // Client-side navigation swaps the page without reloading the script.
  const observer = new MutationObserver(refreshPageState);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
    stops.forEach((stop) => stop());
  };
}
