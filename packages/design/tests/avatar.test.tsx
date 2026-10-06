import { renderToStaticMarkup } from "react-dom/server";
import { AvatarCoin } from "../components/avatar-coin";
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

describe("AvatarCoin", () => {
  it("renders static markup the behavior script can run", () => {
    const html = renderToStaticMarkup(<AvatarCoin />);
    expect(html).toContain("data-avatar-coin");
    expect(
      JSON.parse(
        /data-frames="([^"]+)"/.exec(html)![1]!.replace(/&quot;/g, '"'),
      ),
    ).toHaveLength(10);
    expect(html).toContain(
      'data-durations="250,150,150,300,200,300,400,400,250,600"',
    );
    expect(html).toContain('width="224" height="224"');
  });
});
