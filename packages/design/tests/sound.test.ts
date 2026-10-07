import { describe, expect, it } from "vitest";
import {
  cookieDomain,
  parsePreference,
  readPreference,
  serializePreference,
  SOUND_MAP,
  writePreference,
  type PreferenceEnvironment,
} from "../sound";

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
