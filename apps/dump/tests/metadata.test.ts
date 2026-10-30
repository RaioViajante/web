jest.mock("../lib/render-post", () => ({
  renderPost: async () => () => null,
}));

import type { Post } from "@/lib/posts";

// jest.mock() takes a literal specifier, not one resolved through the "@/"
// alias (see tests/tag-views.test.tsx), so this uses the real relative path.
jest.mock("../lib/posts", () => ({
  ...jest.requireActual("../lib/posts"),
  getAllTags: jest.fn(() => []),
}));

// robots, alternatesFor, and the JSON-LD helpers all resolve through
// site.url, which is fixed at module load — reset modules per test and pin
// the canonical origin, same pattern as tests/site-origin.test.ts.
const ORIGINAL_ENV = process.env;
const PRODUCTION_ORIGIN = "https://dump.raioviajante.com";
const RSS_TYPES = {
  "application/rss+xml": [{ url: "/rss.xml", title: "dump RSS" }],
};
const PT_RSS_TYPES = {
  "application/rss+xml": [
    { url: "/pt/rss.xml", title: "dump RSS (português)" },
  ],
};
const cluster = (en: string, pt: string) => ({
  en: `${PRODUCTION_ORIGIN}${en}`,
  "pt-BR": `${PRODUCTION_ORIGIN}${pt}`,
  "x-default": `${PRODUCTION_ORIGIN}${en}`,
});

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
      languages: cluster("/", "/pt"),
      types: RSS_TYPES,
    });
  });

  it("archive", async () => {
    const { metadata } = await import("@/app/archive/page");
    expect(metadata.alternates).toEqual({
      canonical: "/archive",
      languages: cluster("/archive", "/pt/archive"),
      types: RSS_TYPES,
    });
  });

  it("tags index", async () => {
    const { metadata } = await import("@/app/tags/page");
    expect(metadata.alternates).toEqual({
      canonical: "/tags",
      languages: cluster("/tags", "/pt/tags"),
      types: RSS_TYPES,
    });
  });
});

const PERSON = {
  "@type": "Person",
  "@id": "https://raioviajante.com/#person",
  name: "RaioViajante",
  url: "https://raioviajante.com/",
};

describe("homeJsonLd", () => {
  it("describes the WebSite and its Blog, both by the shared person", async () => {
    const { homeJsonLd } = await import("@/lib/structured-data");
    expect(homeJsonLd()).toEqual([
      {
        "@type": "WebSite",
        "@id": `${PRODUCTION_ORIGIN}/#website`,
        name: "dump",
        description:
          "Computer science notes, projects, devlogs, and technology writing by RaioViajante.",
        url: `${PRODUCTION_ORIGIN}/`,
        inLanguage: ["en", "pt-BR"],
        author: PERSON,
      },
      {
        "@type": "Blog",
        "@id": `${PRODUCTION_ORIGIN}/#blog`,
        name: "dump",
        description:
          "Computer science notes, projects, devlogs, and technology writing by RaioViajante.",
        url: `${PRODUCTION_ORIGIN}/`,
        inLanguage: ["en", "pt-BR"],
        author: PERSON,
        isPartOf: { "@id": `${PRODUCTION_ORIGIN}/#website` },
      },
    ]);
  });
});

describe("blogPostingJsonLd", () => {
  const post: Post = {
    slug: "example-post",
    contentId: "example-post",
    locale: "en",
    originalLocale: "en",
    title: "Example Post",
    description: "An example description.",
    publishedAt: "2026-01-15",
    tags: ["osdev", "x86"],
    draft: false,
  };

  it("derives BlogPosting from real post and site data only", async () => {
    const { blogPostingJsonLd } = await import("@/lib/structured-data");
    const url = `${PRODUCTION_ORIGIN}/posts/example-post`;
    expect(blogPostingJsonLd(post)).toEqual({
      "@type": "BlogPosting",
      headline: "Example Post",
      description: "An example description.",
      datePublished: "2026-01-15",
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url, inLanguage: "en" },
      author: PERSON,
      inLanguage: "en",
      isPartOf: { "@id": `${PRODUCTION_ORIGIN}/#blog` },
      keywords: "osdev, x86",
      image: `${PRODUCTION_ORIGIN}/og/posts/example-post.png`,
    });
  });

  it("omits dateModified without explicit update metadata", async () => {
    const { blogPostingJsonLd } = await import("@/lib/structured-data");
    const data = blogPostingJsonLd(post);
    expect(data).not.toHaveProperty("dateModified");
  });

  it("emits an explicit update as dateModified", async () => {
    const { blogPostingJsonLd } = await import("@/lib/structured-data");
    expect(
      blogPostingJsonLd({ ...post, updatedAt: "2026-02-01" }),
    ).toHaveProperty("dateModified", "2026-02-01");
  });

  it("does not invent a publisher or breadcrumbs", async () => {
    const { blogPostingJsonLd } = await import("@/lib/structured-data");
    const data = blogPostingJsonLd(post);
    expect(data).not.toHaveProperty("publisher");
    expect(data).not.toHaveProperty("breadcrumb");
  });

  it("omits keywords when a post has no tags", async () => {
    const { blogPostingJsonLd } = await import("@/lib/structured-data");
    expect(blogPostingJsonLd({ ...post, tags: [] })).not.toHaveProperty(
      "keywords",
    );
  });

  it("uses the post locale's tag labels as keywords", async () => {
    const { blogPostingJsonLd } = await import("@/lib/structured-data");
    expect(
      blogPostingJsonLd({
        ...post,
        slug: "exemplo",
        locale: "pt-BR",
        originalLocale: "pt-BR",
        tags: ["personal", "meta"],
      }),
    ).toHaveProperty("keywords", "pessoal, meta");
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

    expect(metadata.alternates).toMatchObject({
      canonical: `/posts/${firstPost.slug}`,
      types: RSS_TYPES,
    });
    // An English-only work would have no `languages` at all; this one has a
    // Portuguese counterpart, so its cluster is complete and reciprocal.
    expect(metadata.alternates?.languages).toMatchObject({
      en: `${PRODUCTION_ORIGIN}/posts/${firstPost.slug}`,
      "x-default": `${PRODUCTION_ORIGIN}/posts/${firstPost.slug}`,
    });
  });

  it("post page: exposes explicit publication and modification dates", async () => {
    const { generateMetadata } = await import("@/app/posts/[slug]/page");
    const slug = "split-my-internet-into-four-different-kinds-of-place";
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug }),
    });

    expect(metadata.openGraph).toMatchObject({
      publishedTime: "2026-09-13T00:00:00.000Z",
      modifiedTime: "2026-10-30T00:00:00.000Z",
    });
    expect(metadata.alternates).toMatchObject({ canonical: `/posts/${slug}` });
  });

  it("the English translation of a Portuguese original has a reciprocal cluster with itself as x-default", async () => {
    const { generateMetadata } = await import("@/app/posts/[slug]/page");
    const slug =
      "translating-the-site-without-pretending-everything-already-exists";
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug }),
    });
    expect(metadata.alternates).toEqual({
      canonical: `/posts/${slug}`,
      languages: cluster(
        `/posts/${slug}`,
        "/pt/posts/traduzir-o-site-sem-fingir-que-tudo-ja-existe",
      ),
      types: RSS_TYPES,
    });
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      locale: "en_US",
      alternateLocale: ["pt_BR"],
      publishedTime: "2026-10-19T00:00:00.000Z",
    });
  });

  it("translated Portuguese post has a reciprocal cluster and localized article metadata", async () => {
    const { generateMetadata } = await import("@/app/pt/posts/[slug]/page");
    const slug = "talvez-isso-vire-alguma-coisa-um-dia";
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug }),
    });

    expect(metadata.alternates).toEqual({
      canonical: `/pt/posts/${slug}`,
      languages: cluster(
        "/posts/maybe-this-can-be-something-someday",
        `/pt/posts/${slug}`,
      ),
      types: PT_RSS_TYPES,
    });
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      locale: "pt_BR",
      alternateLocale: ["en_US"],
      url: `${PRODUCTION_ORIGIN}/pt/posts/${slug}`,
      publishedTime: "2026-09-04T00:00:00.000Z",
      images: [
        expect.objectContaining({
          url: `${PRODUCTION_ORIGIN}/og/pt/posts/${slug}.png`,
          width: 1200,
          height: 630,
        }),
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [
        expect.objectContaining({
          url: `${PRODUCTION_ORIGIN}/og/pt/posts/${slug}.png`,
        }),
      ],
    });
  });

  it("Portuguese-original post has a self-canonical and a real English counterpart", async () => {
    const { generateMetadata } = await import("@/app/pt/posts/[slug]/page");
    const slug = "traduzir-o-site-sem-fingir-que-tudo-ja-existe";
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug }),
    });

    expect(metadata.alternates).toEqual({
      canonical: `/pt/posts/${slug}`,
      languages: cluster(
        "/posts/translating-the-site-without-pretending-everything-already-exists",
        `/pt/posts/${slug}`,
      ),
      types: PT_RSS_TYPES,
    });
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      locale: "pt_BR",
      alternateLocale: ["en_US"],
      url: `${PRODUCTION_ORIGIN}/pt/posts/${slug}`,
      publishedTime: "2026-10-19T00:00:00.000Z",
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

  it("English tag aliases canonicalize from the authoritative record", async () => {
    const { generateMetadata } = await import("@/app/tags/[tag]/page");

    const metadata = await generateMetadata({
      params: Promise.resolve({ tag: "OSDEV" }),
    });

    expect(metadata.alternates).toMatchObject({ canonical: "/tags/osdev" });
  });

  it("Portuguese tag lookup is exact and its canonical comes from the taxonomy", async () => {
    const { generateMetadata } = await import("@/app/pt/tags/[tag]/page");

    const metadata = await generateMetadata({
      params: Promise.resolve({ tag: "pessoal" }),
    });
    expect(metadata.alternates).toMatchObject({
      canonical: "/pt/tags/pessoal",
    });

    await expect(
      generateMetadata({ params: Promise.resolve({ tag: "PESSOAL" }) }),
    ).rejects.toThrow(/404/);
  });
});
