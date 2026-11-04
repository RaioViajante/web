import { readFileSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
// @ts-expect-error -- plain ESM build script, no type declarations
import * as script from "../scripts/project-icons.mjs";
import { projectArt, projectIcons } from "../components/projects";

const { all, derive, derivatives, sourceOf, targetOf } = script as {
  all: string[];
  derive: (name: string) => Promise<Buffer>;
  derivatives: Record<
    string,
    { source: string; width?: number; height?: number }
  >;
  sourceOf: (name: string) => string;
  targetOf: (name: string) => string;
};

const pixels = async (input: string | Buffer) =>
  sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

describe("project icons", () => {
  it("declare the committed derivatives' real dimensions", async () => {
    const declared = {
      ...projectIcons,
      "refrain-sticker": projectArt.refrainSticker,
      "mochifile-wordmark": projectArt.mochifileWordmark,
    } as Record<string, { width: number; height: number }>;
    expect(Object.keys(declared).sort()).toEqual([...all].sort());
    for (const name of all) {
      const meta = await sharp(targetOf(name)).metadata();
      expect([meta.width, meta.height], name).toEqual([
        declared[name]!.width,
        declared[name]!.height,
      ]);
    }
  });

  it("are smaller than their sources", async () => {
    for (const name of all) {
      const source = await sharp(
        sourceOf(derivatives[name]!.source),
      ).metadata();
      const derived = await sharp(targetOf(name)).metadata();
      expect(derived.width!, name).toBeLessThan(source.width!);
    }
  });

  it("still match what `pnpm --filter @raioviajante/design project-icons` produces", async () => {
    for (const name of all) {
      const fresh = await pixels(await derive(name));
      const committed = await pixels(readFileSync(targetOf(name)));
      expect(committed.info, name).toEqual(fresh.info);
      let total = 0;
      for (let i = 0; i < fresh.data.length; i++)
        total += Math.abs(fresh.data[i]! - committed.data[i]!);
      expect(
        total / fresh.data.length,
        `${name}.webp is out of date: run pnpm --filter @raioviajante/design project-icons`,
      ).toBeLessThan(1);
    }
  });
});
