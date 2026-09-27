import type { Post } from "@/lib/posts";

// jest.mock() takes a literal specifier, not one resolved through the "@/"
// alias (see tests/tag-views.test.tsx), so this uses the real relative path.
jest.mock("../lib/posts", () => ({
  ...jest.requireActual("../lib/posts"),
  getAllTags: jest.fn(),
}));

// robots, alternatesFor, and the JSON-LD helpers all resolve through
// site.url, which is fixed at module load — reset modules per test and pin
// the canonical origin, same pattern as tests/site-origin.test.ts.
const ORIGINAL_ENV = process.env;
const PRODUCTION_ORIGIN = "https://dump.raioviajante.com";
const RSS_TYPES = {
  "application/rss+xml": [{ url: "/rss.xml", title: "dump RSS" }],
};

beforeEach(() => {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV };
  process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_ORIGIN;
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe("robots", () => {
  it("allows public crawling and points at the canonical sitemap", async () => {
    const robots = (await import("@/app/robots")).default;
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${PRODUCTION_ORIGIN}/sitemap.xml`,
    });
  });
});

describe("alternatesFor", () => {
  it("always includes RSS autodiscovery, even with no canonical", async () => {
    const { alternatesFor } = await import("@/lib/site");
    expect(alternatesFor()).toEqual({ types: RSS_TYPES });
  });

  it("adds a self-referencing canonical without dropping RSS", async () => {
    const { alternatesFor } = await import("@/lib/site");
    expect(alternatesFor("/archive")).toEqual({
      canonical: "/archive",
      types: RSS_TYPES,
    });
  });
});

describe("static pages keep canonical and RSS together", () => {
  // Regression coverage: Next replaces a page's whole `alternates` object
  // rather than merging it with the layout's, so a page that sets only
  // `canonical` silently loses the inherited RSS link. Every page below
  // must carry both.
  it("homepage", async () => {
    const { metadata } = await import("@/app/page");
    expect(metadata.alternates).toEqual({
      canonical: "/",
      types: RSS_TYPES,
    });
  });

  it("archive", async () => {
    const { metadata } = await import("@/app/archive/page");
    expect(metadata.alternates).toEqual({
      canonical: "/archive",
      types: RSS_TYPES,
    });
  });

  it("tags index", async () => {
    const { metadata } = await import("@/app/tags/page");
    expect(metadata.alternates).toEqual({
      canonical: "/tags",
      types: RSS_TYPES,
    });
  });

  it("about", async () => {
    const { metadata } = await import("@/app/about/page");
    expect(metadata.alternates).toEqual({
      canonical: "/about",
      types: RSS_TYPES,
    });
  });

  it("uses", async () => {
    const { metadata } = await import("@/app/uses/page");
    expect(metadata.alternates).toEqual({
      canonical: "/uses",
      types: RSS_TYPES,
    });
  });
});

describe("websiteJsonLd", () => {
  it("describes the site from real site.ts data, on the canonical origin", async () => {
    const { websiteJsonLd } = await import("@/lib/structured-data");
    expect(websiteJsonLd()).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "dump",
      description:
        "Computer science notes, projects, devlogs, and technology writing by RaioViajante.",
      url: PRODUCTION_ORIGIN,
    });
  });
});

describe("blogPostingJsonLd", () => {
  const post: Post = {
    slug: "example-post",
    title: "Example Post",
    description: "An example description.",
    date: "2026-01-15",
    tags: ["osdev"],
    draft: false,
  };

  it("derives BlogPosting from real post and site data only", async () => {
    const { blogPostingJsonLd } = await import("@/lib/structured-data");
    expect(blogPostingJsonLd(post)).toEqual({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "Example Post",
      description: "An example description.",
      datePublished: "2026-01-15",
      url: `${PRODUCTION_ORIGIN}/posts/example-post`,
      author: { "@type": "Person", name: "RaioViajante" },
      image: `${PRODUCTION_ORIGIN}/posts/example-post/opengraph-image`,
    });
  });

  it("does not invent dateModified, a publisher, or breadcrumbs", async () => {
    const { blogPostingJsonLd } = await import("@/lib/structured-data");
    const data = blogPostingJsonLd(post);
    expect(data).not.toHaveProperty("dateModified");
    expect(data).not.toHaveProperty("publisher");
    expect(data).not.toHaveProperty("breadcrumb");
  });
});

describe("jsonLdScript", () => {
  it("serializes to valid, parseable JSON", async () => {
    const { jsonLdScript } = await import("@/lib/structured-data");
    expect(JSON.parse(jsonLdScript({ a: 1 }))).toEqual({ a: 1 });
  });

  it("escapes '<' so an embedded value can't close the surrounding script tag", async () => {
    const { jsonLdScript } = await import("@/lib/structured-data");
    const dangerous = { headline: "</script><script>evil()</script>" };

    const script = jsonLdScript(dangerous);

    expect(script).not.toContain("</script>");
    expect(JSON.parse(script.replaceAll("\\u003c", "<"))).toEqual(dangerous);
  });
});

describe("dynamic route pages keep canonical and RSS together", () => {
  it("post page: canonical article URL", async () => {
    const { generateMetadata, generateStaticParams } =
      await import("@/app/posts/[slug]/page");
    const [firstPost] = generateStaticParams();
    if (!firstPost) throw new Error("Expected at least one published post.");
    const metadata = await generateMetadata({
      params: Promise.resolve(firstPost),
    });

    expect(metadata.alternates).toEqual({
      canonical: `/posts/${firstPost.slug}`,
      types: RSS_TYPES,
    });
  });

  it("tag page: canonical tag URL", async () => {
    const { generateMetadata } = await import("@/app/tags/[tag]/page");

    const metadata = await generateMetadata({
      params: Promise.resolve({ tag: "osdev" }),
    });

    expect(metadata.alternates).toEqual({
      canonical: "/tags/osdev",
      types: RSS_TYPES,
    });
  });
});
