/**
 * Page entrance motion, shared by every page of the four sites.
 *
 * When a page appears, the persistent chrome (sound bar, sidebar, footer)
 * stays still and the content of `<main id="main">` enters top to bottom in
 * a short, slightly springy cascade. Nothing outside `main` ever moves, and
 * nothing is stored (no first-visit flag: see docs/privacy-storage.md).
 *
 * Guarantees (see docs/design-system.md, "Motion"):
 * - Nothing is hidden before this script runs, and nothing the visitor has
 *   already seen is hidden again: on a document that has painted before the
 *   script ran (Next.js hydration), the content above the fold stays as it is.
 * - Without `animate`, `IntersectionObserver` or `matchMedia`, under reduced
 *   motion, or in a hidden document, nothing moves and everything is visible.
 * - No inline styles are written. A cascading target is held at its first
 *   keyframe by its own animation (`fill: "backwards"`), and a target below
 *   the fold waits under `data-motion-state="waiting"` (motion.css). Cancelling
 *   either one shows the element as its stylesheet says.
 * - Focus or a pointer press inside a pending target shows it at once; a route
 *   change, a click on a link to a fragment of this page, an anchor jump
 *   (`hashchange`), a hidden document, `pagehide` or reduced motion settle
 *   everything.
 *
 * Targets come from a small selector list instead of per-app CSS:
 * `MOTION_ITEMS` always cascade on their own, `MOTION_GROUPS` are walked into,
 * and any other child is one target. Apps mark their own items with
 * `data-motion` (`data-motion="card"` for the larger bounce), a container to
 * walk into with `data-motion-group`, and opt out with `data-motion="off"`.
 */

/** Always cascade on their own, wherever they sit. */
export const MOTION_ITEMS =
  '.rv-leader, [data-motion]:not([data-motion="off"])';

/** Walked into: their children cascade one by one; they never move as a whole. */
export const MOTION_GROUPS = [
  "section",
  "article",
  ".rv-header",
  ".prose",
  ".rv-section > ol",
  ".rv-section > ul",
  ".rv-section > dl",
  "[data-motion-group]",
].join(", ");

/** Neither animated nor walked into. */
export const MOTION_OFF = '[data-motion="off"], script, style, template';

/** The larger offset and bounce: project cards and the index avatar. */
export const MOTION_BOUNCY =
  '[data-motion="card"], .rv-header > .avatar-coin, .rv-header > .rv-avatar';

/** Marks a target below the fold until it scrolls into view (motion.css hides it). */
export const MOTION_STATE = "data-motion-state";

/** Two targets whose tops differ by at most this many pixels share a row. */
export const ROW_TOLERANCE = 12;

/** How far into the viewport a waiting target must come before it enters. */
const SCROLL_INSET = 40;

export interface MotionTiming {
  /** Delay between two targets. */
  stagger: number;
  /** The largest delay of a cascade, however many targets it has. */
  cap: number;
  /** Opacity 0 → 1. */
  fade: number;
  /** The spring of an ordinary target, and its offset in pixels. */
  rise: number;
  riseY: number;
  /** The spring of a card or the avatar, and its offset in pixels. */
  bounce: number;
  bounceY: number;
}

/** The custom properties in styles/tokens.css that set the timing. */
export const MOTION_TOKENS: Record<keyof MotionTiming, string> = {
  stagger: "--enter-stagger",
  cap: "--enter-cap",
  fade: "--enter-fade",
  rise: "--enter-rise",
  riseY: "--enter-rise-y",
  bounce: "--enter-bounce",
  bounceY: "--enter-bounce-y",
};

/**
 * The same values as tokens.css, used when the stylesheet is not loaded.
 * A test keeps this mirror equal to the tokens.
 */
export const MOTION_DEFAULTS: MotionTiming = {
  stagger: 65,
  cap: 450,
  fade: 180,
  rise: 280,
  riseY: 12,
  bounce: 500,
  bounceY: 28,
};

/** Reads the timing tokens (`65ms`, `0.45s`, `12px`); a missing one keeps its default. */
export function readTiming(root: Element = document.documentElement) {
  const style = getComputedStyle(root);
  const timing = { ...MOTION_DEFAULTS };
  for (const key of Object.keys(MOTION_TOKENS) as (keyof MotionTiming)[]) {
    const raw = style.getPropertyValue(MOTION_TOKENS[key]).trim();
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) continue;
    timing[key] =
      raw.endsWith("ms") || !raw.endsWith("s") ? value : value * 1000;
  }
  return timing;
}

/**
 * The cascade targets inside `root`, in document order. Items win over groups,
 * a group (or any element holding an item) is walked into, and every other
 * child is one target.
 */
export function selectTargets(root: ParentNode): HTMLElement[] {
  const targets: HTMLElement[] = [];
  const walk = (parent: ParentNode) => {
    for (const child of Array.from(parent.children)) {
      if (!(child instanceof HTMLElement) || child.matches(MOTION_OFF))
        continue;
      if (child.matches(MOTION_ITEMS)) targets.push(child);
      else if (
        child.matches(MOTION_GROUPS) ||
        child.querySelector(MOTION_ITEMS)
      )
        walk(child);
      else targets.push(child);
    }
  };
  walk(root);
  return targets;
}

/** Whether a target is drawn in the flow: hidden, empty or positioned elements never move. */
function inFlow(element: HTMLElement, rect: DOMRect) {
  if (rect.width === 0 || rect.height === 0) return false;
  const style = getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    style.position !== "absolute" &&
    style.position !== "fixed"
  );
}

export interface Placed<T> {
  item: T;
  top: number;
  left: number;
}

/**
 * Visual order: by top, and left to right among targets whose tops are within
 * `tolerance` pixels of the row's first one (the left card of a two-column
 * grid comes before the right one).
 */
export function visualOrder<T>(
  placed: Placed<T>[],
  tolerance = ROW_TOLERANCE,
): T[] {
  const sorted = [...placed].sort((a, b) => a.top - b.top || a.left - b.left);
  const rows: Placed<T>[][] = [];
  for (const entry of sorted) {
    const row = rows.at(-1);
    if (row && entry.top - row[0]!.top <= tolerance) row.push(entry);
    else rows.push([entry]);
  }
  return rows.flatMap((row) =>
    row.sort((a, b) => a.left - b.left).map((entry) => entry.item),
  );
}

/** One delay per target: `step` apart, compressed so the last one is at most `cap`. */
export function staggerDelays(count: number, step: number, cap: number) {
  const gap = count > 1 ? Math.min(step, cap / (count - 1)) : 0;
  return Array.from({ length: count }, (_, index) => Math.round(index * gap));
}

/**
 * A light spring: rise from `distance` pixels below, overshoot a little, then
 * settle. The scale squashes from `from`, swells to `over` and settles to 1.
 */
export function springKeyframes(
  distance: number,
  from: number,
  over: number,
): Keyframe[] {
  const swell = over - 1;
  const at = (y: number, scale: number) =>
    `translateY(${Number(y.toFixed(2))}px) scale(${Number(scale.toFixed(4))})`;
  return [
    { offset: 0, transform: at(distance, from), easing: "ease-out" },
    {
      offset: 0.55,
      transform: at(-distance * 0.14, over),
      easing: "ease-in-out",
    },
    {
      offset: 0.8,
      transform: at(distance * 0.04, 1 - swell * 0.4),
      easing: "ease-in-out",
    },
    { offset: 1, transform: "translateY(0px) scale(1)" },
  ];
}

function play(element: HTMLElement, delay: number, timing: MotionTiming) {
  const bouncy = element.matches(MOTION_BOUNCY);
  const shared = { delay, fill: "backwards" as const };
  return [
    element.animate([{ opacity: 0 }, { opacity: 1 }], {
      ...shared,
      duration: timing.fade,
      easing: "ease-out",
    }),
    element.animate(
      bouncy
        ? springKeyframes(timing.bounceY, 0.95, 1.035)
        : springKeyframes(timing.riseY, 0.99, 1.01),
      { ...shared, duration: bouncy ? timing.bounce : timing.rise },
    ),
  ];
}

/** Whether this document painted content before the script ran. */
function alreadyPainted() {
  try {
    return performance
      .getEntriesByType("paint")
      .some((entry) => entry.name === "first-contentful-paint");
  } catch {
    return false;
  }
}

function supported() {
  return (
    typeof window.IntersectionObserver === "function" &&
    typeof window.matchMedia === "function" &&
    typeof HTMLElement.prototype.animate === "function"
  );
}

function hiddenDocument() {
  return (
    document.hidden ||
    (document as Document & { prerendering?: boolean }).prerendering === true
  );
}

/**
 * Starts the entrance motion for this page and for later client-side
 * navigations (Next.js keeps the document; a changed pathname with a new
 * `<main>` is a new page). Returns a stop function that settles everything.
 */
export function attachMotion() {
  if (!supported()) return () => {};

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const timing = readTiming();
  const pending = new Map<HTMLElement, Animation[]>();
  const waiting = new Set<HTMLElement>();

  const settle = (element: HTMLElement) => {
    pending.get(element)?.forEach((animation) => animation.cancel());
    pending.delete(element);
    if (waiting.delete(element)) {
      element.removeAttribute(MOTION_STATE);
      observer.unobserve(element);
    }
  };
  const settleAll = () => {
    [...pending.keys(), ...waiting].forEach(settle);
  };

  const cascade = (placed: Placed<HTMLElement>[]) => {
    const ordered = visualOrder(placed);
    const delays = staggerDelays(ordered.length, timing.stagger, timing.cap);
    ordered.forEach((element, index) => {
      const animations = play(element, delays[index]!, timing);
      pending.set(element, animations);
      Promise.all(animations.map((animation) => animation.finished)).then(
        () => {
          if (pending.get(element) === animations) pending.delete(element);
        },
        () => {}, // cancelled: settle() already removed it
      );
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const ready: Placed<HTMLElement>[] = [];
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (!entry.isIntersecting || !waiting.has(element)) continue;
        settle(element);
        const rect = entry.boundingClientRect;
        // Passed by an anchor jump or a restored scroll: just show it.
        if (rect.bottom <= 0 || hiddenDocument() || reduce.matches) continue;
        ready.push({ item: element, top: rect.top, left: rect.left });
      }
      cascade(ready);
    },
    // Everything above the viewport counts as reached, so a target that was
    // jumped over is shown; below, a target enters a little after its edge.
    { rootMargin: `100000px 0px -${SCROLL_INSET}px 0px` },
  );

  const run = (main: HTMLElement | null, arrival: boolean) => {
    settleAll();
    if (!main || reduce.matches || hiddenDocument()) return;
    const viewport = window.innerHeight;
    const active = document.activeElement;
    const now: Placed<HTMLElement>[] = [];
    for (const element of selectTargets(main)) {
      // Never move what holds focus, and never delay a focus ring.
      if (active && active !== document.body && element.contains(active))
        continue;
      const rect = element.getBoundingClientRect();
      if (!inFlow(element, rect) || rect.bottom <= 0) continue;
      if (rect.top < viewport) {
        if (arrival)
          now.push({ item: element, top: rect.top, left: rect.left });
      } else {
        waiting.add(element);
        element.setAttribute(MOTION_STATE, "waiting");
        observer.observe(element);
      }
    }
    cascade(now);
  };

  const reveal = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    for (const element of [...pending.keys(), ...waiting])
      if (element.contains(target)) settle(element);
  };
  // A link to a fragment of this page: settle before the browser scrolls, so
  // it lands on the resting position and not on a target still moving.
  const onClick = (event: MouseEvent) => {
    const target = event.target;
    const link =
      target instanceof Element
        ? target.closest<HTMLAnchorElement>("a[href]")
        : null;
    if (
      link?.hash &&
      link.origin === window.location.origin &&
      link.pathname === window.location.pathname &&
      link.search === window.location.search
    )
      settleAll();
  };
  const onVisibility = () => {
    if (document.hidden) settleAll();
  };
  const onReduce = () => {
    if (reduce.matches) settleAll();
  };

  // The first page of the document.
  run(document.getElementById("main"), !alreadyPainted());

  // Client-side navigation (Next.js): wait for a new pathname AND a new main.
  let path = window.location.pathname;
  let main = document.getElementById("main");
  let first = main?.firstElementChild ?? null;
  const routes = new MutationObserver(() => {
    if (window.location.pathname === path) return;
    const next = document.getElementById("main");
    if (next === main && (next?.firstElementChild ?? null) === first) return;
    path = window.location.pathname;
    main = next;
    first = next?.firstElementChild ?? null;
    run(next, true);
  });
  routes.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("focusin", reveal, true);
  document.addEventListener("pointerdown", reveal, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("visibilitychange", onVisibility);
  // An anchor jump shows its destination as it is: nothing slides into place.
  window.addEventListener("hashchange", settleAll);
  window.addEventListener("pagehide", settleAll);
  reduce.addEventListener?.("change", onReduce);

  return () => {
    routes.disconnect();
    document.removeEventListener("focusin", reveal, true);
    document.removeEventListener("pointerdown", reveal, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("hashchange", settleAll);
    window.removeEventListener("pagehide", settleAll);
    reduce.removeEventListener?.("change", onReduce);
    settleAll();
    observer.disconnect();
  };
}
