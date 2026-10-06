/**
 * The one client script every page runs: sound toggle and preference, soft
 * block behavior (copy, tabs, collapse), and the 404 requested path.
 *
 * Astro:  <script>import { startBehavior } from "@raioviajante/design/behavior"; startBehavior();</script>
 * Next.js: render <Behavior /> from "@raioviajante/design/behavior-react" once in the layout.
 */
import { attachBlocks } from "./blocks/client";
import { initSound } from "./sound/init";
import { attachScroll } from "./scroll";
import { attachSearch } from "./search/client";

function fillRequestedPath() {
  document
    .querySelectorAll<HTMLElement>("[data-requested-path]")
    .forEach((node) => {
      if (node.textContent !== window.location.pathname)
        node.textContent = window.location.pathname;
    });
}

export function startBehavior() {
  const stops = [initSound(), attachBlocks(), attachSearch(), attachScroll()];
  fillRequestedPath();
  // Client-side navigation swaps the page without reloading the script.
  const observer = new MutationObserver(fillRequestedPath);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
    stops.forEach((stop) => stop());
  };
}
