import { getPostSlugs } from "@/lib/posts";

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
