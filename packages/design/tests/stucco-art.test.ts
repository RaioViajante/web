import { readdirSync, readFileSync, statSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { stuccoBrand, stuccoPhotos, stuccoTour } from "../components/stucco";

const dir = new URL("../assets/projects/stucco/", import.meta.url);
const files = readdirSync(dir);
const budget = JSON.parse(
  readFileSync(new URL("../../../perf/budgets.json", import.meta.url), "utf8"),
).largestImage as number;

describe("Stucco. case images", () => {
  it("have the steps and pieces of the approved tour", () => {
    expect(stuccoTour.desktop).toHaveLength(11);
    expect(stuccoTour.mobile).toHaveLength(15);
    expect(stuccoBrand.pieces.map(({ key }) => key)).toEqual([
      "business",
      "review",
      "car",
      "social",
    ]);
    expect(stuccoBrand.pieces.map(({ art }) => art.length)).toEqual([
      2, 2, 1, 2,
    ]);
    expect(stuccoPhotos).toHaveLength(4);
  });

  it("stay under the single-image budget and carry no metadata", async () => {
    expect(files.length).toBe(103);
    for (const name of files) {
      const file = new URL(name, dir);
      expect(statSync(file).size, name).toBeLessThanOrEqual(budget);
      const meta = await sharp(file.pathname).metadata();
      expect(meta.format, name).toBe("webp");
      expect(meta.exif ?? meta.xmp ?? meta.iptc, name).toBeUndefined();
    }
  });

  it("declare each largest variant's real width and height", async () => {
    const images = [
      ...stuccoTour.desktop.flatMap(({ shot, thumb }) => [shot, thumb]),
      ...stuccoTour.mobile.flatMap(({ shot, thumb }) => [shot, thumb]),
      stuccoBrand.cover,
      ...stuccoBrand.pieces.flatMap(({ mockup, art }) => [mockup, ...art]),
      ...stuccoPhotos,
    ];
    for (const image of images) {
      const name = image.src.split("/").pop()!;
      const meta = await sharp(new URL(name, dir).pathname).metadata();
      expect([meta.width, meta.height], name).toEqual([
        image.width,
        image.height,
      ]);
    }
  });
});
