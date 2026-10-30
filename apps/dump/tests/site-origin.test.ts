import type { Post } from "@/lib/posts";
import { VERIFIED_UPDATES } from "./verified-updates";

// `lib/site.ts` resolves the canonical origin once, at module load, so every
// test here needs a fresh module instance after changing `process.env`.

const ORIGINAL_ENV = process.env;
const PRODUCTION_ORIGIN = "https://dump.raioviajante.com";

beforeEach(() => {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV };
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe("resolveSiteUrl priority and normalization", () => {
  it("falls back to localhost in development, with no env configured", async () => {
    const { site } = await import("@/lib/site");
    expect(site.url).toBe("http://localhost:3000");
  });

  it("prefers an explicit NEXT_PUBLIC_SITE_URL over the Vercel production host", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_ORIGIN;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "dump-example.vercel.app";

    const { site } = await import("@/lib/site");
    expect(site.url).toBe(PRODUCTION_ORIGIN);
  });

  it("falls back to the Vercel production host when no explicit URL is set", async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "dump-example.vercel.app";

    const { site } = await import("@/lib/site");
    expect(site.url).toBe("https://dump-example.vercel.app");
  });

  it("strips a trailing slash from an explicit NEXT_PUBLIC_SITE_URL", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = `${PRODUCTION_ORIGIN}/`;

    const { site, absoluteUrl } = await import("@/lib/site");
    expect(site.url).toBe(PRODUCTION_ORIGIN);
    expect(absoluteUrl("/archive")).toBe(`${PRODUCTION_ORIGIN}/archive`);
  });
});

describe("metadata, RSS, and sitemap under the canonical production origin", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_ORIGIN;
  });

  it("resolves the root layout's metadataBase from the canonical origin", async () => {
    const { metadata } = await import("@/app/layout");
    expect(metadata.metadataBase?.toString()).toBe(`${PRODUCTION_ORIGIN}/`);
  });

  it("builds every sitemap URL from the canonical origin", async () => {
    const sitemap = (await import("@/app/sitemap")).default;
    const urls = sitemap();

    expect(urls.length).toBeGreaterThan(0);
    for (const entry of urls) {
      expect(entry.url.startsWith(`${PRODUCTION_ORIGIN}/`)).toBe(true);
    }
    // lastmod comes only from an explicit `updatedAt`, on every version of
    // the verified updates (tests/verified-updates.ts).
    const withLastmod = urls
      .filter((entry) => "lastModified" in entry)
      .map((entry) => [entry.url, entry.lastModified]);
    expect(withLastmod).toHaveLength(Object.keys(VERIFIED_UPDATES).length * 2);
    for (const [, lastModified] of withLastmod)
      expect(lastModified).toBe("2026-10-30");
    expect(
      withLastmod.map(([url]) => String(url).split("/").pop()).sort(),
    ).toEqual([
      "dividi-minha-internet-em-quatro-tipos-diferentes-de-lugar",
      "split-my-internet-into-four-different-kinds-of-place",
      "traduzir-o-site-sem-fingir-que-tudo-ja-existe",
      "translating-the-site-without-pretending-everything-already-exists",
    ]);
    expect(
      urls.find((entry) =>
        entry.url.endsWith("/posts/there-is-no-printf-down-here"),
      ),
    ).not.toHaveProperty("lastModified");
  });

  it("builds the RSS channel and item links from the canonical origin", async () => {
    const { renderRssFeed } = await import("@/lib/rss");

    const posts: Post[] = [
      {
        slug: "example",
        contentId: "example",
        locale: "en",
        originalLocale: "en",
        title: "Example",
        description: "An example post.",
        publishedAt: "2026-01-01",
        tags: [],
        draft: false,
      },
    ];
    const feed = renderRssFeed(posts);

    expect(feed).toContain(`<link>${PRODUCTION_ORIGIN}</link>`);
    expect(feed).toContain(`href="${PRODUCTION_ORIGIN}/rss.xml" rel="self"`);
    expect(feed).toContain(`<link>${PRODUCTION_ORIGIN}/posts/example</link>`);
    expect(feed).not.toContain("localhost");
  });
});
