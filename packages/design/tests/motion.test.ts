// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MOTION_DEFAULTS,
  MOTION_STATE,
  MOTION_TOKENS,
  attachMotion,
  selectTargets,
  springKeyframes,
  staggerDelays,
  visualOrder,
} from "../motion";

// jsdom replaces the global URL, so resolve the stylesheets by path.
const styles = join(dirname(fileURLToPath(import.meta.url)), "../styles");
const tokens = readFileSync(join(styles, "tokens.css"), "utf8");
const motionCss = readFileSync(join(styles, "motion.css"), "utf8");

/** jsdom lays nothing out: elements report the box written in data-top/data-left. */
function layout() {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      const data = (this as HTMLElement).dataset ?? {};
      const top = Number(data.top ?? 0);
      const left = Number(data.left ?? 0);
      const height = data.top === undefined ? 0 : 20;
      return {
        top,
        left,
        bottom: top + height,
        right: left + 100,
        width: data.top === undefined ? 0 : 100,
        height,
        x: left,
        y: top,
        toJSON: () => ({}),
      } as DOMRect;
    },
  );
}

interface FakeAnimation {
  element: Element;
  keyframes: Keyframe[] | PropertyIndexedKeyframes;
  options: KeyframeAnimationOptions;
  cancel: ReturnType<typeof vi.fn>;
  finished: Promise<unknown>;
}
let animations: FakeAnimation[] = [];

function supportAnimate() {
  animations = [];
  HTMLElement.prototype.animate = function (
    this: HTMLElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions,
  ) {
    let reject!: (reason: unknown) => void;
    const finished = new Promise((_, no) => (reject = no));
    finished.catch(() => {});
    const animation: FakeAnimation = {
      element: this,
      keyframes: keyframes!,
      options: options as KeyframeAnimationOptions,
      cancel: vi.fn(() => reject(new Error("cancelled"))),
      finished,
    };
    animations.push(animation);
    return animation as unknown as Animation;
  };
}

class FakeObserver {
  static last: FakeObserver | undefined;
  observed = new Set<Element>();
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {
    FakeObserver.last = this;
  }
  observe(element: Element) {
    this.observed.add(element);
  }
  unobserve(element: Element) {
    this.observed.delete(element);
  }
  disconnect() {
    this.observed.clear();
  }
  /** Reports `element` as intersecting, with its box moved to `top`. */
  enter(element: HTMLElement, top: number) {
    element.dataset.top = String(top);
    this.callback(
      [
        {
          target: element,
          isIntersecting: true,
          boundingClientRect: element.getBoundingClientRect(),
        } as unknown as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }
}

let reduced = false;
const mediaListeners = new Set<() => void>();
function supportMedia() {
  window.matchMedia = ((query: string) => ({
    media: query,
    get matches() {
      return reduced;
    },
    addEventListener: (_: string, listener: () => void) =>
      mediaListeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      mediaListeners.delete(listener),
  })) as unknown as typeof window.matchMedia;
}

const page = `
  <header class="rv-sound" data-top="10"><button>SOUND OFF</button></header>
  <aside class="rv-sidebar">
    <nav class="rv-nav"><div class="rv-label" data-top="100">PAGES</div><a href="/" data-top="130">index</a></nav>
  </aside>
  <main id="main" tabindex="-1">
    <header class="rv-header rv-header--index">
      <button class="avatar-coin" data-top="100" data-left="300"><img class="rv-avatar" alt=""></button>
      <h1 data-top="220" data-left="300">dump</h1>
      <p data-top="280" data-left="300">a line</p>
    </header>
    <section class="rv-section">
      <h2 data-top="340" data-left="300">01. Projects</h2>
      <div class="pj-list">
        <article data-motion="card" class="right" data-top="405" data-left="700">right</article>
        <article data-motion="card" class="left" data-top="400" data-left="300">left</article>
      </div>
      <div class="entry"><a class="rv-leader" data-top="460" data-left="300">a</a><p class="note" data-top="490" data-left="300">note</p></div>
      <ol><li data-top="520" data-left="300">one</li></ol>
      <div class="gallery" data-motion="off" data-top="540"><p data-top="540">art</p></div>
      <p class="rv-sr-only" style="position: absolute" data-top="560">hidden</p>
      <p class="later" data-top="2000" data-left="300">below the fold</p>
    </section>
  </main>
  <footer class="rv-footer" data-top="2400">footer</footer>`;

let stop: (() => void) | undefined;
beforeEach(() => {
  reduced = false;
  mediaListeners.clear();
  window.history.replaceState(null, "", "/");
  supportAnimate();
  supportMedia();
  window.IntersectionObserver =
    FakeObserver as unknown as typeof IntersectionObserver;
  layout();
  document.body.innerHTML = page;
});
afterEach(() => {
  stop?.();
  stop = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

const animated = () => [
  ...new Set(animations.map((animation) => animation.element as HTMLElement)),
];
const label = (element: Element) =>
  element.className || element.tagName.toLowerCase();

describe("tokens", () => {
  it("motion.ts mirrors the timing tokens in tokens.css", () => {
    for (const [key, name] of Object.entries(MOTION_TOKENS)) {
      const match = tokens.match(new RegExp(`${name}:\\s*([\\d.]+)(ms|px);`));
      expect(match, name).not.toBeNull();
      expect(Number(match![1]), name).toBe(
        MOTION_DEFAULTS[key as keyof typeof MOTION_DEFAULTS],
      );
    }
  });

  it("stays inside the requested ranges", () => {
    expect(MOTION_DEFAULTS.stagger).toBeGreaterThanOrEqual(60);
    expect(MOTION_DEFAULTS.stagger).toBeLessThanOrEqual(75);
    expect(MOTION_DEFAULTS.cap).toBe(450);
  });

  it("adds no cross-document view transition and no color", () => {
    expect(motionCss).not.toMatch(/@view-transition|view-transition-name/);
    expect(motionCss).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
  });
});

describe("target selection", () => {
  it("walks groups, keeps items whole and skips what is off", () => {
    const targets = selectTargets(document.getElementById("main")!);
    expect(targets.map(label)).toEqual([
      "avatar-coin",
      "h1",
      "p",
      "h2",
      "right",
      "left",
      "rv-leader",
      "note",
      "li",
      "rv-sr-only",
      "later",
    ]);
  });

  it("never selects the chrome or the footer", () => {
    const targets = selectTargets(document.getElementById("main")!);
    for (const target of targets)
      expect(target.closest(".rv-sound, .rv-sidebar, .rv-footer")).toBeNull();
  });
});

describe("visual order", () => {
  it("puts the left card of a row before the right one", () => {
    const order = visualOrder([
      { item: "right", top: 405, left: 700 },
      { item: "left", top: 400, left: 300 },
      { item: "title", top: 100, left: 300 },
      { item: "next row", top: 430, left: 0 },
    ]);
    expect(order).toEqual(["title", "left", "right", "next row"]);
  });
});

describe("stagger", () => {
  it("steps by the token while the cascade is short", () => {
    expect(staggerDelays(4, 65, 450)).toEqual([0, 65, 130, 195]);
  });

  it("compresses a long page under the cap", () => {
    const delays = staggerDelays(60, 65, 450);
    expect(delays.at(-1)).toBeLessThanOrEqual(450);
    expect(delays).toEqual([...delays].sort((a, b) => a - b));
  });

  it("the spring settles to rest and squashes slightly", () => {
    const frames = springKeyframes(12, 0.99, 1.01);
    expect(frames[0]!.transform).toBe("translateY(12px) scale(0.99)");
    expect(frames.at(-1)!.transform).toBe("translateY(0px) scale(1)");
    expect(frames[1]!.transform).toContain("scale(1.01)");
  });
});

describe("attachMotion", () => {
  it("cascades above-the-fold content in visual order and waits for the rest", () => {
    stop = attachMotion();
    const order = animated().map(label);
    expect(order).toEqual([
      "avatar-coin",
      "h1",
      "p",
      "h2",
      "left",
      "right",
      "rv-leader",
      "note",
      "li",
    ]);
    // Opacity and transform only, held by the animation during its delay.
    for (const animation of animations) {
      expect(animation.options.fill).toBe("backwards");
      const props = Object.keys((animation.keyframes as Keyframe[])[0]!).filter(
        (key) => key !== "offset" && key !== "easing",
      );
      expect(["opacity", "transform"]).toEqual(expect.arrayContaining(props));
    }
    const delays = animations
      .filter(
        (animation) => "opacity" in (animation.keyframes as Keyframe[])[0]!,
      )
      .map((animation) => animation.options.delay!);
    expect(Math.max(...delays)).toBeLessThanOrEqual(450);
    const later = document.querySelector<HTMLElement>(".later")!;
    expect(later.getAttribute(MOTION_STATE)).toBe("waiting");
    expect(document.querySelector(".gallery")!.hasAttribute(MOTION_STATE)).toBe(
      false,
    );
  });

  it("gives cards and the avatar the larger bounce", () => {
    stop = attachMotion();
    const transformOf = (selector: string) =>
      animations.find(
        (animation) =>
          animation.element === document.querySelector(selector) &&
          "transform" in (animation.keyframes as Keyframe[])[0]!,
      )!;
    expect(transformOf(".left").options.duration).toBe(500);
    expect((transformOf(".left").keyframes as Keyframe[])[0]!.transform).toBe(
      "translateY(28px) scale(0.95)",
    );
    expect(transformOf("h1").options.duration).toBe(280);
  });

  it("reveals a waiting target when it scrolls into view, and one jumped over at once", () => {
    stop = attachMotion();
    const observer = FakeObserver.last!;
    expect(observer.options?.rootMargin).toMatch(/px 0px -\d+px 0px$/);
    const later = document.querySelector<HTMLElement>(".later")!;
    animations = [];
    observer.enter(later, 600);
    expect(later.hasAttribute(MOTION_STATE)).toBe(false);
    expect(animated()).toEqual([later]);

    stop();
    document.body.innerHTML = page;
    stop = attachMotion();
    const jumped = document.querySelector<HTMLElement>(".later")!;
    animations = [];
    FakeObserver.last!.enter(jumped, -400);
    expect(jumped.hasAttribute(MOTION_STATE)).toBe(false);
    expect(animations).toEqual([]);
  });

  it("never moves the sound bar, the sidebar or the footer", () => {
    stop = attachMotion();
    expect(animations.length).toBeGreaterThan(0);
    expect(
      animated().some((element) =>
        element.closest(".rv-sound, .rv-sidebar, .rv-footer"),
      ),
    ).toBe(false);
    expect(
      document.querySelector(
        `.rv-sound[${MOTION_STATE}], .rv-sidebar [${MOTION_STATE}], .rv-footer[${MOTION_STATE}]`,
      ),
    ).toBeNull();
  });

  it("stores nothing", () => {
    const set = vi.spyOn(Storage.prototype, "setItem");
    const get = vi.spyOn(Storage.prototype, "getItem");
    stop = attachMotion();
    expect(set).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });

  it("does not hide content a document already painted before it ran", () => {
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([
      { name: "first-contentful-paint" } as PerformanceEntry,
    ]);
    stop = attachMotion();
    expect(animations).toEqual([]);
    // Below the fold is unseen: it still enters on scroll.
    expect(document.querySelector(".later")!.getAttribute(MOTION_STATE)).toBe(
      "waiting",
    );
  });

  it("under reduced motion shows everything and starts nothing", () => {
    reduced = true;
    stop = attachMotion();
    expect(animations).toEqual([]);
    expect(document.querySelector(`[${MOTION_STATE}]`)).toBeNull();
  });

  it("settles everything when reduced motion is switched on", () => {
    stop = attachMotion();
    reduced = true;
    mediaListeners.forEach((listener) => listener());
    expect(
      animations.every((animation) => animation.cancel.mock.calls.length),
    ).toBe(true);
    expect(document.querySelector(`[${MOTION_STATE}]`)).toBeNull();
  });

  it.each([
    [
      "IntersectionObserver",
      () => Reflect.deleteProperty(window, "IntersectionObserver"),
    ],
    ["animate", () => Reflect.deleteProperty(HTMLElement.prototype, "animate")],
    ["matchMedia", () => Reflect.deleteProperty(window, "matchMedia")],
  ])("without %s shows everything", (_name, remove) => {
    remove();
    stop = attachMotion();
    expect(animations).toEqual([]);
    expect(document.querySelector(`[${MOTION_STATE}]`)).toBeNull();
  });

  it("stop() cancels pending work and leaves inline styles as they were", () => {
    const styles = [...document.querySelectorAll("*")].map((element) =>
      element.getAttribute("style"),
    );
    stop = attachMotion();
    expect(animations.length).toBeGreaterThan(0);
    stop();
    stop = undefined;
    for (const animation of animations)
      expect(animation.cancel).toHaveBeenCalled();
    expect(document.querySelector(`[${MOTION_STATE}]`)).toBeNull();
    expect(
      [...document.querySelectorAll("*")].map((element) =>
        element.getAttribute("style"),
      ),
    ).toEqual(styles);
  });

  it("focus or a press inside a pending target shows it at once", () => {
    stop = attachMotion();
    const leader = document.querySelector<HTMLElement>(".rv-leader")!;
    leader.setAttribute("href", "#");
    leader.focus();
    for (const animation of animations.filter((a) => a.element === leader))
      expect(animation.cancel).toHaveBeenCalled();
    const later = document.querySelector<HTMLElement>(".later")!;
    later.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(later.hasAttribute(MOTION_STATE)).toBe(false);
  });

  it("never moves the element that holds focus", () => {
    const leader = document.querySelector<HTMLElement>(".rv-leader")!;
    leader.setAttribute("href", "#");
    leader.focus();
    stop = attachMotion();
    expect(animated()).not.toContain(leader);
  });

  it("settles everything on an anchor jump", () => {
    stop = attachMotion();
    window.dispatchEvent(new Event("hashchange"));
    expect(
      animations.every((animation) => animation.cancel.mock.calls.length),
    ).toBe(true);
    expect(document.querySelector(`[${MOTION_STATE}]`)).toBeNull();
  });

  it("settles everything before following a link to this page's fragment", () => {
    stop = attachMotion();
    const other = document.createElement("a");
    other.href = "/elsewhere#part";
    document.body.append(other);
    other.addEventListener("click", (event) => event.preventDefault());
    other.click();
    expect(document.querySelector(`[${MOTION_STATE}]`)).not.toBeNull();

    const link = document.createElement("a");
    link.href = "#part";
    document.body.append(link);
    link.addEventListener("click", (event) => event.preventDefault());
    link.click();
    expect(
      animations.every((animation) => animation.cancel.mock.calls.length),
    ).toBe(true);
    expect(document.querySelector(`[${MOTION_STATE}]`)).toBeNull();
  });

  it("settles everything when the document is hidden", () => {
    stop = attachMotion();
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(
      animations.every((animation) => animation.cancel.mock.calls.length),
    ).toBe(true);
    expect(document.querySelector(`[${MOTION_STATE}]`)).toBeNull();
  });

  it("runs again on a client-side route change, settling the old page first", async () => {
    stop = attachMotion();
    const first = [...animations];
    animations = [];

    // A pathname change alone is not a new page yet.
    window.history.pushState(null, "", "/next");
    document
      .querySelector(".rv-footer")!
      .append(document.createElement("span"));
    await Promise.resolve();
    expect(animations).toEqual([]);

    // The framework swaps <main>: the new page cascades, the chrome does not.
    const main = document.getElementById("main")!;
    main.innerHTML = `<header class="rv-header"><h1 data-top="120">next</h1></header>`;
    await new Promise((resolve) => setTimeout(resolve));
    expect(first.every((animation) => animation.cancel.mock.calls.length)).toBe(
      true,
    );
    expect(animated().map(label)).toEqual(["h1"]);
  });
});
