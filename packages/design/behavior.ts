/**
 * The one client script every page runs: sound toggle and preference, soft
 * block behavior (copy, tabs, collapse), and the 404 requested path.
 *
 * Astro:  <script>import { startBehavior } from "@raioviajante/design/behavior"; startBehavior();</script>
 * Next.js: render <Behavior /> from "@raioviajante/design/behavior-react" once in the layout.
 */
import { attachBlocks } from "./blocks/client";
import { initSound } from "./sound/init";

function fillRequestedPath() {
  document
    .querySelectorAll<HTMLElement>("[data-requested-path]")
    .forEach((node) => {
      node.textContent = window.location.pathname;
    });
}

export function startBehavior() {
  const stops = [initSound(), attachBlocks()];
  fillRequestedPath();
  return () => stops.forEach((stop) => stop());
}
