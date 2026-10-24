// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatLocationTime,
  initOwnerClock,
  updateOwnerClocks,
} from "../clock";

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("owner location clock", () => {
  it("formats São Paulo and Dublin through explicit IANA timezones", () => {
    const instant = new Date("2026-01-15T12:34:00Z");
    expect(formatLocationTime(instant, "America/Sao_Paulo")).toBe("09:34");
    expect(formatLocationTime(instant, "Europe/Dublin")).toBe("12:34");
  });

  it("lets Intl apply Dublin daylight-saving changes", () => {
    expect(
      formatLocationTime(new Date("2026-03-29T00:30:00Z"), "Europe/Dublin"),
    ).toBe("00:30");
    expect(
      formatLocationTime(new Date("2026-03-29T01:30:00Z"), "Europe/Dublin"),
    ).toBe("02:30");
  });

  it("updates at the next minute without announcing live changes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:34:40Z"));
    document.body.innerHTML = '<time data-owner-clock="">--:--</time>';

    const stop = initOwnerClock();
    const clock = document.querySelector("time")!;
    expect(clock.textContent).toBe("09:34");
    expect(clock.getAttribute("datetime")).toBe("09:34");
    expect(clock.hasAttribute("aria-live")).toBe(false);

    vi.advanceTimersByTime(20_020);
    expect(clock.textContent).toBe("09:35");
    stop();
  });

  it("resynchronizes immediately when a background tab becomes visible", () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<time data-owner-clock="">--:--</time>';
    vi.setSystemTime(new Date("2026-01-15T12:34:00Z"));
    const stop = initOwnerClock();
    expect(document.querySelector("time")?.textContent).toBe("09:34");

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    vi.setSystemTime(new Date("2026-01-15T12:48:00Z"));
    document.dispatchEvent(new Event("visibilitychange"));
    expect(document.querySelector("time")?.textContent).toBe("09:34");

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(document.querySelector("time")?.textContent).toBe("09:48");
    stop();
  });

  it("uses only the repository configuration when painting the page", () => {
    document.body.innerHTML = '<time data-owner-clock="">--:--</time>';
    updateOwnerClocks(new Date("2026-01-15T12:34:00Z"));
    expect(document.querySelector("time")?.textContent).toBe("09:34");
    expect(document.querySelector("[data-time-zone]")).toBeNull();
    expect(document.querySelector("input, select, button")).toBeNull();
  });
});
