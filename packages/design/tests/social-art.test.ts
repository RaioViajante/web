import { readFileSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
// @ts-expect-error -- plain ESM build script, no type declarations
import * as script from "../scripts/social-art.mjs";

const { socialArt, derive } = script as {
  socialArt: [string, string, number][];
  derive: (source: string, width: number) => Promise<Buffer>;
};

const file = (name: string) =>
  readFileSync(new URL(`../assets/social/${name}`, import.meta.url));

describe("case social card art", () => {
  it("is a small JPEG at the declared width", async () => {
    for (const [name, , width] of socialArt) {
      const meta = await sharp(file(name)).metadata();
      expect(meta.format, name).toBe("jpeg");
      expect(meta.width, name).toBe(width);
      expect(file(name).length, name).toBeLessThan(80 * 1024);
    }
  });

  it("still matches what `pnpm --filter @raioviajante/design social-art` produces", async () => {
    for (const [name, source, width] of socialArt) {
      const fresh = await sharp(await derive(source, width))
        .raw()
        .toBuffer();
      const committed = await sharp(file(name)).raw().toBuffer();
      expect(committed.length, name).toBe(fresh.length);
      let total = 0;
      for (let i = 0; i < fresh.length; i++)
        total += Math.abs(fresh[i]! - committed[i]!);
      expect(total / fresh.length, name).toBeLessThan(1);
    }
  }, 30_000);
});
