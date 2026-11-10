import { playSound } from "@raioviajante/design/sound";

/** Pause between two pieces, so a row lands like popcorn and not all at once. */
const POP_STEP_MS = 110;
/** How long a piece waits for its image before it pops anyway. */
const IMAGE_WAIT_MS = 500;

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
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return () => undefined;

  const pieces = Array.from(
    root.querySelectorAll<HTMLElement>(".gallery-piece"),
  );
  const waiting = new Set(pieces);
  let queue: HTMLElement[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  function pop(piece: HTMLElement) {
    waiting.delete(piece);
    void imageReady(piece).then(() => {
      if (stopped) return;
      piece.dataset.pop = "in";
      playSound("gallery");
    });
  }

  function drain() {
    if (timer !== undefined) return;
    const next = queue.shift();
    if (!next) return;
    pop(next);
    timer = setTimeout(() => {
      timer = undefined;
      drain();
    }, POP_STEP_MS);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const seen = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => entry.target as HTMLElement);
      if (!seen.length) return;
      for (const piece of seen) observer.unobserve(piece);
      queue.push(...seen.filter((piece) => waiting.has(piece)));
      drain();
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.2 },
  );

  function onFocus(event: FocusEvent) {
    const piece = (event.target as Element).closest<HTMLElement>(
      ".gallery-piece",
    );
    if (!piece || !waiting.has(piece)) return;
    observer.unobserve(piece);
    queue = queue.filter((item) => item !== piece);
    pop(piece);
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
