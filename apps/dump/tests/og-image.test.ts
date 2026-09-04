import {
  loadOgFonts,
  OG_FONT_MONO,
  OG_FONT_SERIF,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  ogDate,
  titleFontSize,
} from "@/lib/og-image";
import { getPostSlugs } from "@/lib/posts";

describe("titleFontSize", () => {
  it("uses the largest size for short titles", () => {
    expect(titleFontSize("A short title")).toBe(72);
  });

  it("steps down for medium titles", () => {
    const title = "A".repeat(55);
    expect(titleFontSize(title)).toBe(60);
  });

  it("steps down further for long titles", () => {
    const title = "A".repeat(85);
    expect(titleFontSize(title)).toBe(48);
  });

  it("never shrinks past a legible floor, however long the title", () => {
    const title = "A".repeat(500);
    expect(titleFontSize(title)).toBe(40);
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
        name: OG_FONT_SERIF,
        weight: 700,
        style: "normal",
      }),
      expect.objectContaining({
        name: OG_FONT_MONO,
        weight: 400,
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

describe("site-level opengraph-image", () => {
  it("declares the standard OG dimensions and PNG content type", async () => {
    const mod = await import("@/app/opengraph-image");
    expect(mod.size).toEqual(OG_IMAGE_SIZE);
    expect(mod.contentType).toBe(OG_IMAGE_CONTENT_TYPE);
    expect(mod.alt).toContain("dump");
  });
});

describe("per-post opengraph-image", () => {
  it("declares the standard OG dimensions and PNG content type", async () => {
    const mod = await import("@/app/posts/[slug]/opengraph-image");
    expect(mod.size).toEqual(OG_IMAGE_SIZE);
    expect(mod.contentType).toBe(OG_IMAGE_CONTENT_TYPE);
  });

  it("does not statically render slugs outside the real content set", async () => {
    const mod = await import("@/app/posts/[slug]/opengraph-image");
    expect(mod.dynamicParams).toBe(false);
  });

  it("generates one image per real published post, so future posts get one automatically", async () => {
    const mod = await import("@/app/posts/[slug]/opengraph-image");
    expect(mod.generateStaticParams()).toEqual(
      getPostSlugs().map((slug) => ({ slug })),
    );
  });
});

describe("root layout Twitter card", () => {
  it("upgrades to summary_large_image now that OG images exist", async () => {
    const { metadata } = await import("@/app/layout");
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
