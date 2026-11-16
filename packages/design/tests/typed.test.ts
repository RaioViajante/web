// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { attachTypedTitles } from "../typed";

let reduce = false;
let listeners: (() => void)[] = [];
const original = window.matchMedia;

beforeEach(() => {
  reduce = false;
  listeners = [];
  window.matchMedia = ((query: string) => ({
    get matches() {
      return reduce;
    },
    media: query,
    addEventListener: (_: string, listener: () => void) =>
      listeners.push(listener),
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
  document.body.innerHTML =
    '<h1 class="rv-typed" aria-label="Hi"><span class="rv-c0">H</span><span class="rv-c1">i</span></h1>';
});

afterEach(() => {
  window.matchMedia = original;
  document.body.innerHTML = "";
});

const title = () => document.querySelector(".rv-typed")!;
const animationEnd = (name: string) => {
  const event = new Event("animationend", { bubbles: true });
  Object.defineProperty(event, "animationName", { value: name });
  title().lastElementChild!.dispatchEvent(event);
};

describe("typed titles", () => {
  it("are done once their caret has blinked out, not before", () => {
    const stop = attachTypedTitles();
    animationEnd("rv-type");
    expect(title().hasAttribute("data-typed")).toBe(false);
    animationEnd("rv-caret");
    expect(title().getAttribute("data-typed")).toBe("done");
    stop();
  });

  it("are done at once when reduced motion is asked for, now or later", () => {
    reduce = true;
    const stop = attachTypedTitles();
    expect(title().getAttribute("data-typed")).toBe("done");
    stop();

    title().removeAttribute("data-typed");
    reduce = false;
    const again = attachTypedTitles();
    expect(title().hasAttribute("data-typed")).toBe(false);
    reduce = true;
    listeners.forEach((listener) => listener());
    expect(title().getAttribute("data-typed")).toBe("done");
    again();
  });
});
