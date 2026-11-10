import { playSound } from "@raioviajante/design/sound";

/** Pause between two pieces, so a row lands like popcorn and not all at once. */
const POP_STEP_MS = 110;
/** How long a piece waits for its image before it pops anyway. */
const IMAGE_WAIT_MS = 500;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** The gallery's reduced-motion check, shared by its motion and its sounds. */
export const prefersReducedMotion = () =>
  window.matchMedia(REDUCED_MOTION).matches;

function center(element: Element) {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

/** Resolves when the named CSS animations inside `root` have finished or been cancelled. */
export function animationsSettle(root: Element, names: readonly string[]) {
  return Promise.allSettled(
    root
      .getAnimations({ subtree: true })
      .filter(
        (animation) =>
          animation instanceof CSSAnimation &&
          names.includes(animation.animationName),
      )
      .map((animation) => animation.finished),
  );
}

/**
 * Points every sticker in `root` at `origin`, so the burst in gallery.css
 * starts inside the cover and the gather ends there. Nearest stickers go first.
 */
export function aimStickers(origin: Element, root: Element) {
  const stickers = Array.from(
    root.querySelectorAll<HTMLElement>(".gallery-sticker"),
  );
  // An earlier opening's offset would be part of what is measured below.
  for (const sticker of stickers) {
    sticker.style.removeProperty("--burst-x");
    sticker.style.removeProperty("--burst-y");
  }
  const from = center(origin);
  stickers
    .map((sticker) => {
      const home = center(sticker);
      return { sticker, x: from.x - home.x, y: from.y - home.y };
    })
    .sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))
    .forEach(({ sticker, x, y }, order) => {
      sticker.style.setProperty("--burst-x", `${Math.round(x)}px`);
      sticker.style.setProperty("--burst-y", `${Math.round(y)}px`);
      sticker.style.setProperty("--burst-order", String(order));
    });
}

/** Aims the stickers and keeps them out of the pointer's way while they fly. */
export function aimStickerBurst(origin: Element, root: Element) {
  aimStickers(origin, root);
  // In flight they would pass under a resting pointer and play its hover sound.
  root.setAttribute("data-bursting", "");
  void animationsSettle(root, ["gallery-sticker-burst"]).then(() =>
    root.removeAttribute("data-bursting"),
  );
}

function imageReady(piece: HTMLElement) {
  const image = piece.querySelector("img");
  if (!image || (image.complete && image.naturalWidth > 0))
    return Promise.resolve();
  return Promise.race([
    image.decode().catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, IMAGE_WAIT_MS)),
  ]);
}

/**
 * Hides the pieces in `root` and pops each one in, with the gallery sound, as
 * it scrolls into view. Only the script hides them, so without it, in print and
 * under reduced motion the artwork simply stays visible. Returns a stop function.
 */
export function attachPiecePop(root: HTMLElement) {
  const reduced = window.matchMedia(REDUCED_MOTION);
  if (reduced.matches) return () => undefined;

  const pieces = Array.from(
    root.querySelectorAll<HTMLElement>(".gallery-piece"),
  );
  const waiting = new Set(pieces);
  const inView = new Set<HTMLElement>();
  let queue: HTMLElement[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  /** Shows a piece without the pop or its sound. */
  function reveal(piece: HTMLElement) {
    waiting.delete(piece);
    observer.unobserve(piece);
    delete piece.dataset.pop;
  }

  function pop(piece: HTMLElement) {
    waiting.delete(piece);
    observer.unobserve(piece);
    void imageReady(piece).then(() => {
      // Focus may have revealed it while the image loaded: no late pop then.
      if (stopped || piece.dataset.pop !== "waiting") return;
      piece.dataset.pop = "in";
      playSound("gallery");
    });
  }

  function drain() {
    if (timer !== undefined) return;
    let next = queue.shift();
    // Scrolled away before its turn: no pop, and no sound, off screen.
    while (next && !inView.has(next)) {
      reveal(next);
      next = queue.shift();
    }
    if (!next) return;
    pop(next);
    timer = setTimeout(() => {
      timer = undefined;
      drain();
    }, POP_STEP_MS);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const piece = entry.target as HTMLElement;
        if (!entry.isIntersecting) {
          inView.delete(piece);
          continue;
        }
        inView.add(piece);
        if (waiting.has(piece) && !queue.includes(piece)) queue.push(piece);
      }
      drain();
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.2 },
  );

  function onFocus(event: FocusEvent) {
    const piece = (event.target as Element).closest<HTMLElement>(
      ".gallery-piece",
    );
    // Still hidden: queued, or popping but waiting for its image.
    if (!piece || piece.dataset.pop !== "waiting") return;
    // Focus must land on something visible: no pop, no wait for the image.
    queue = queue.filter((item) => item !== piece);
    reveal(piece);
  }

  function onAnimationEnd(event: AnimationEvent) {
    if (event.animationName !== "gallery-piece-pop") return;
    delete (event.target as HTMLElement).dataset.pop;
  }

  function stop() {
    stopped = true;
    clearTimeout(timer);
    observer.disconnect();
    root.removeEventListener("focusin", onFocus);
    root.removeEventListener("animationend", onAnimationEnd);
    reduced.removeEventListener("change", stop);
    for (const piece of pieces) delete piece.dataset.pop;
  }

  root.addEventListener("focusin", onFocus);
  root.addEventListener("animationend", onAnimationEnd);
  reduced.addEventListener("change", stop);
  for (const piece of pieces) {
    piece.dataset.pop = "waiting";
    observer.observe(piece);
  }
  return stop;
}
