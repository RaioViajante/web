// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
  prefersReducedMotion,
  REDUCED_MOTION_QUERY,
  reducedMotionQuery,
} from "../reduced-motion";

const original = window.matchMedia;
let asked: string[] = [];

function prefer(reduce: boolean) {
  asked = [];
  window.matchMedia = ((query: string) => {
    asked.push(query);
    return { matches: reduce, media: query } as MediaQueryList;
  }) as typeof window.matchMedia;
}

afterEach(() => {
  window.matchMedia = original;
});

describe("reduced motion", () => {
  it("asks the browser the one reduce query", () => {
    prefer(true);
    expect(prefersReducedMotion()).toBe(true);
    expect(asked).toEqual([REDUCED_MOTION_QUERY]);
    expect(REDUCED_MOTION_QUERY).toBe("(prefers-reduced-motion: reduce)");
  });

  it("reads the preference at call time, so a change is seen", () => {
    prefer(false);
    expect(prefersReducedMotion()).toBe(false);
    prefer(true);
    expect(prefersReducedMotion()).toBe(true);
  });

  it("hands out the live query for code that follows changes", () => {
    prefer(false);
    expect(reducedMotionQuery().media).toBe(REDUCED_MOTION_QUERY);
  });
});
