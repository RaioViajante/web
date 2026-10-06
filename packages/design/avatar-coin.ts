/**
 * Runs the index-header avatar (`[data-avatar-coin]`): a ten-frame loop that
 * starts once every frame has loaded, and a flip on click. With reduced
 * motion the centered frame stays still and the button is disabled.
 */

function setUp(button: HTMLButtonElement) {
  const image = button.querySelector("img");
  if (!image) return () => {};
  const frames = JSON.parse(button.dataset.frames ?? "[]") as string[];
  const durations = (button.dataset.durations ?? "").split(",").map(Number);
  const rest = Number(button.dataset.rest ?? 0);
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer: number | undefined;
  let generation = 0;
  let preload: Promise<void> | undefined;
  let disposed = false;

  const stop = () => {
    window.clearTimeout(timer);
    timer = undefined;
  };
  const show = (index: number) => {
    if (disposed || motion.matches) return;
    image.src = frames[index] ?? image.src;
    timer = window.setTimeout(
      () => show((index + 1) % frames.length),
      durations[index] ?? 250,
    );
  };
  const update = () => {
    const current = ++generation;
    stop();
    image.src = frames[rest] ?? image.src;
    button.disabled = motion.matches;
    button.setAttribute(
      "aria-label",
      motion.matches
        ? "Illustrated RaioViajante character"
        : "Flip RaioViajante avatar",
    );
    if (motion.matches) {
      button.classList.remove("is-flipping");
      return;
    }
    preload ??= Promise.all(
      frames.map(
        (src) =>
          new Promise<void>((resolve, reject) => {
            const probe = new Image();
            probe.onload = () => void probe.decode().then(resolve, resolve);
            probe.onerror = reject;
            probe.src = src;
          }),
      ),
    ).then(() => undefined);
    void preload.then(
      () => {
        if (!disposed && current === generation && !motion.matches) show(0);
      },
      () => {
        // Keep the centered frame if any frame cannot load.
      },
    );
  };
  const flip = () => button.classList.add("is-flipping");
  const flipped = () => button.classList.remove("is-flipping");

  update();
  motion.addEventListener("change", update);
  button.addEventListener("click", flip);
  image.addEventListener("animationend", flipped);
  return () => {
    disposed = true;
    generation++;
    stop();
    motion.removeEventListener("change", update);
    button.removeEventListener("click", flip);
    image.removeEventListener("animationend", flipped);
  };
}

export function attachAvatarCoin() {
  const active = new Map<HTMLButtonElement, () => void>();
  const scan = () => {
    const present = new Set(
      document.querySelectorAll<HTMLButtonElement>("[data-avatar-coin]"),
    );
    for (const [button, dispose] of active) {
      if (!present.has(button)) {
        dispose();
        active.delete(button);
      }
    }
    for (const button of present) {
      if (!active.has(button)) active.set(button, setUp(button));
    }
  };
  scan();
  // A client-side navigation swaps the page: pick up or drop the avatar.
  const observer = new MutationObserver(scan);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
    active.forEach((dispose) => dispose());
    active.clear();
  };
}
