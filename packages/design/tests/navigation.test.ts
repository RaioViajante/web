// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { startBehavior } from "../behavior";
import { getSoundPlayer } from "../sound/player";

const toggle = (label = "OFF") =>
  `<div class="rv-sound"><button data-sound-toggle aria-pressed="false">SOUND <span>${label}</span></button></div>`;

afterEach(() => {
  document.body.innerHTML = "";
  document.cookie = "rv-sound=; max-age=0";
});

let contexts = 0;
/** Any method returns another stub, so the synth can build its graph. */
function stub(): unknown {
  return new Proxy(function () {}, {
    get: (_target, key) =>
      key === "currentTime" ? 0 : key === "state" ? "running" : stub(),
    set: () => true,
    apply: () => stub(),
  });
}
function FakeAudioContext() {
  contexts += 1;
  return stub();
}
(globalThis as unknown as { AudioContext: unknown }).AudioContext =
  FakeAudioContext;

describe("client-side navigation", () => {
  it("keeps one sound player and paints the new page's toggle", async () => {
    (window as unknown as { matchMedia: unknown }).matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    });
    document.body.innerHTML = toggle();
    const stop = startBehavior();
    const player = getSoundPlayer();
    player.setEnabled(true);
    expect(
      document.querySelector("[data-sound-toggle] span")?.textContent,
    ).toBe("ON");

    // The router swaps the page: a new toggle, still marked OFF in the markup.
    document.body.innerHTML = toggle("OFF");
    await new Promise((resolve) => setTimeout(resolve));
    expect(
      document.querySelector("[data-sound-toggle] span")?.textContent,
    ).toBe("ON");
    expect(getSoundPlayer()).toBe(player);
    expect(contexts).toBeLessThanOrEqual(1);
    stop();
  });

  it("fills the requested path on a 404 reached by client navigation", async () => {
    const stop = startBehavior();
    document.body.innerHTML = '<span data-requested-path="">/</span>';
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.querySelector("[data-requested-path]")?.textContent).toBe(
      window.location.pathname,
    );
    stop();
  });
});
