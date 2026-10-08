// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  attachSoundEvents,
  cookieDomain,
  parsePreference,
  readPreference,
  serializePreference,
  SOUND_MAP,
  writePreference,
  type PreferenceEnvironment,
} from "../sound";
import type { SoundAction } from "../sound";

function fakeEnvironment(
  init: {
    cookie?: string;
    legacy?: string;
    hostname?: string;
    protocol?: string;
  } = {},
) {
  const state = {
    cookie: init.cookie ?? "",
    legacy: init.legacy ?? (null as string | null),
    written: [] as string[],
  };
  const env: PreferenceEnvironment = {
    hostname: init.hostname ?? "dump.raioviajante.com",
    protocol: init.protocol ?? "https:",
    getCookie: () => state.cookie,
    setCookie: (value) => {
      state.written.push(value);
      state.cookie = value.split(";")[0];
    },
    getLegacy: () => state.legacy,
    clearLegacy: () => {
      state.legacy = null;
    },
  };
  return { env, state };
}

describe("sound map", () => {
  it("maps every event in DESIGN-SYSTEM 5b to a synthesized kind", () => {
    const events = SOUND_MAP.map((entry) => entry.event);
    for (const required of [
      "toggle sound",
      "hover nav item",
      "open link / page",
      "open search",
      "type in search",
      "move selection",
      "copy",
      "switch tab / filter",
      "expand / collapse",
      "action accepted",
      "action rejected",
    ])
      expect(events).toContain(required);
  });
});

describe("preference", () => {
  it("shares one cookie across subdomains", () => {
    expect(cookieDomain("raioviajante.com")).toBe(".raioviajante.com");
    expect(cookieDomain("lab.raioviajante.com")).toBe(".raioviajante.com");
    expect(cookieDomain("localhost")).toBeNull();
    expect(serializePreference(true, "docs.raioviajante.com", "https:")).toBe(
      "rv-sound=on; Path=/; Max-Age=31536000; SameSite=Lax; Domain=.raioviajante.com; Secure",
    );
    expect(serializePreference(false, "localhost", "http:")).not.toContain(
      "Domain",
    );
  });

  it("defaults to off", () => {
    expect(readPreference(fakeEnvironment().env)).toBe(false);
  });

  it("round-trips through the cookie", () => {
    const { env } = fakeEnvironment();
    writePreference(true, env);
    expect(readPreference(env)).toBe(true);
    expect(parsePreference("a=b; rv-sound=off; c=d")).toBe(false);
  });

  it("honors a legacy localStorage value without writing anything", () => {
    const { env, state } = fakeEnvironment({ legacy: "on" });
    expect(readPreference(env)).toBe(true);
    expect(readPreference(env)).toBe(true);
    expect(state.written).toEqual([]);
    expect(state.cookie).toBe("");
    expect(state.legacy).toBe("on");
  });

  it("an explicit toggle writes the cookie and retires the legacy value", () => {
    const { env, state } = fakeEnvironment({ legacy: "on" });
    writePreference(false, env);
    expect(state.written).toEqual([
      "rv-sound=off; Path=/; Max-Age=31536000; SameSite=Lax; Domain=.raioviajante.com; Secure",
    ]);
    expect(state.legacy).toBeNull();
    expect(readPreference(env)).toBe(false);
  });

  it("keeps local development host-only when toggled", () => {
    const { env, state } = fakeEnvironment({
      hostname: "localhost",
      protocol: "http:",
    });
    writePreference(true, env);
    expect(state.written).toEqual([
      "rv-sound=on; Path=/; Max-Age=31536000; SameSite=Lax",
    ]);
    expect(readPreference(env)).toBe(true);
  });

  it("prefers the cookie over legacy storage", () => {
    const { env } = fakeEnvironment({ cookie: "rv-sound=off", legacy: "on" });
    expect(readPreference(env)).toBe(false);
  });
});

describe("delegated sound events", () => {
  function fixture() {
    document.body.innerHTML = `
      <div id="wrap">
        <button type="button" data-sound="gallery" id="cover">
          <span id="inner"></span>
        </button>
      </div>`;
    const plays: [string, SoundAction | undefined][] = [];
    const detach = attachSoundEvents((kind, action) =>
      plays.push([kind, action]),
    );
    return {
      plays,
      detach,
      wrap: document.getElementById("wrap")!,
      cover: document.getElementById("cover")!,
      inner: document.getElementById("inner")!,
    };
  }

  function fire(
    type: string,
    target: Element | Document,
    relatedTarget: Element | null = null,
    x = 10,
    y = 10,
  ) {
    target.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        relatedTarget,
        clientX: x,
        clientY: y,
      }),
    );
  }

  it("plays one hover per entry and one click per activation", () => {
    const { plays, detach, cover, inner } = fixture();
    fire("pointerover", cover);
    expect(plays).toEqual([["gallery", undefined]]);
    // Transitions inside the same control are not another entry.
    fire("pointerout", cover, inner);
    fire("pointerover", inner, cover);
    expect(plays).toHaveLength(1);
    fire("click", inner);
    expect(plays).toEqual([
      ["gallery", undefined],
      ["gallery", "click"],
    ]);
    detach();
  });

  it("suppresses a layout-driven re-entry into the same control at rest", () => {
    const { plays, detach, wrap, cover } = fixture();
    fire("pointerover", cover, null, 100, 200);
    expect(plays).toHaveLength(1);
    // Reveal animations re-hit-test the stationary pointer: it briefly leaves
    // the control to its parent and re-enters at the same coordinates, with no
    // pointermove in between. That synthetic re-entry must not play again.
    fire("pointerout", cover, wrap, 100, 200);
    fire("pointerover", wrap, cover, 100, 200);
    fire("pointerout", wrap, cover, 100, 200);
    fire("pointerover", cover, wrap, 100, 200);
    expect(plays).toHaveLength(1);
    detach();
  });

  it("plays again when the pointer genuinely moves away and back", () => {
    const { plays, detach, wrap, cover } = fixture();
    fire("pointerover", cover, null, 100, 200);
    fire("pointerout", cover, wrap, 100, 200);
    fire("pointermove", document);
    fire("pointerover", cover, wrap, 100, 200);
    expect(plays).toEqual([
      ["gallery", undefined],
      ["gallery", undefined],
    ]);
    detach();
  });

  it("plays a re-entry at different coordinates even without a move event", () => {
    const { plays, detach, wrap, cover } = fixture();
    fire("pointerover", cover, null, 100, 200);
    fire("pointerout", cover, wrap, 100, 200);
    fire("pointerover", cover, wrap, 140, 200);
    expect(plays).toHaveLength(2);
    detach();
  });

  it("detaches every listener", () => {
    const { plays, detach, cover } = fixture();
    detach();
    fire("pointerover", cover);
    fire("click", cover);
    expect(plays).toEqual([]);
  });
});
