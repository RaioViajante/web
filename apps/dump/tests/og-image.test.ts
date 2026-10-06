import { loadOgFonts, OG_FONT, ogDate, titleFontSize } from "@/lib/og-image";
import { getPostSlugs } from "@/lib/posts";

describe("titleFontSize", () => {
  it("uses the largest size for short titles", () => {
    expect(titleFontSize("A short title")).toBe(70);
  });

  it("steps down for medium titles", () => {
    const title = "A".repeat(55);
    expect(titleFontSize(title)).toBe(58);
  });

  it("steps down further for long titles", () => {
    const title = "A".repeat(85);
    expect(titleFontSize(title)).toBe(46);
  });

  it("never shrinks past a legible floor, however long the title", () => {
    const title = "A".repeat(500);
    expect(titleFontSize(title)).toBe(38);
  });
});

describe("ogDate", () => {
  it("formats an ISO post date as dotted numeric", () => {
    expect(ogDate("2026-09-04")).toBe("2026.09.04");
  });
});

describe("loadOgFonts", () => {
  it("loads exactly the two weights the images use", async () => {
    const fonts = await loadOgFonts();

    expect(fonts).toEqual([
      expect.objectContaining({
        name: OG_FONT,
        weight: 400,
        style: "normal",
      }),
      expect.objectContaining({
        name: OG_FONT,
        weight: 700,
        style: "normal",
      }),
    ]);
    for (const font of fonts) {
      expect(Buffer.isBuffer(font.data)).toBe(true);
      expect(font.data.byteLength).toBeGreaterThan(0);
    }
  });

  it("reads each font file only once, reusing the same promise", async () => {
    const [first, second] = await Promise.all([loadOgFonts(), loadOgFonts()]);
    expect(first).toBe(second);
  });
});

describe("shared social image route", () => {
  it("renders at build time only for real pages", async () => {
    const mod = await import("@/app/og/[...slug]/route");
    expect(mod.dynamic).toBe("force-static");
    expect(mod.dynamicParams).toBe(false);
  });

  it("generates one image per published post, so future posts get one automatically", async () => {
    const mod = await import("@/app/og/[...slug]/route");
    const keys = mod.generateStaticParams().map(({ slug }) => slug.join("/"));
    for (const slug of getPostSlugs()) {
      expect(keys).toContain(`posts/${slug}.png`);
    }
    expect(keys).toContain("index.png");
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("root layout Twitter card", () => {
  it("upgrades to summary_large_image now that OG images exist", async () => {
    const { metadata } = await import("@/app/layout");
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
