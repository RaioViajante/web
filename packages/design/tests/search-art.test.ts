import { readFileSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
// @ts-expect-error -- plain ESM build script, no type declarations
import { derive, size, source, target } from "../scripts/search-art.mjs";
import { art } from "../components/art";

const pixels = async (input: string | Buffer) =>
  sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

describe("search illustration", () => {
  it("is a right-sized derivative of the untouched source", async () => {
    const meta = await sharp(source as string).metadata();
    expect(meta.width).toBe(640);
    const derived = await sharp(target as string).metadata();
    expect([derived.width, derived.height]).toEqual([size, size]);
    expect([art.searchCharacter.width, art.searchCharacter.height]).toEqual([
      size,
      size,
    ]);
  });

  it("still matches what `pnpm --filter @raioviajante/design search-art` produces", async () => {
    const fresh = await pixels(await derive());
    const committed = await pixels(readFileSync(target as string));
    expect(committed.info).toEqual(fresh.info);
    // Tolerant of encoder differences between platforms; a stale or edited
    // file differs by far more than this.
    let total = 0;
    for (let i = 0; i < fresh.data.length; i++) {
      total += Math.abs(fresh.data[i]! - committed.data[i]!);
    }
    expect(
      total / fresh.data.length,
      "search-character.png is out of date: run pnpm --filter @raioviajante/design search-art",
    ).toBeLessThan(0.5);
  });
});
