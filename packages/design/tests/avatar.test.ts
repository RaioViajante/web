import { describe, expect, it } from "vitest";
import { AVATAR_FRAME_SIZE, avatarFrames } from "../components/avatar";

describe("avatar frames", () => {
  it("exports ten distinct frames", () => {
    expect(avatarFrames).toHaveLength(10);
    expect(new Set(avatarFrames).size).toBe(10);
  });

  it("exports them at twice the 112px display size", () => {
    expect(AVATAR_FRAME_SIZE).toBe(224);
  });
});
