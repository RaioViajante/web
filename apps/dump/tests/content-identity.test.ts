import path from "node:path";

import {
  chronologicalNeighbours,
  relatedPosts,
  series,
  seriesOf,
} from "@/lib/post-details";
import {
  findPostVersion,
  getAllPosts,
  getAllTags,
  getPostBySlug,
  getPostVersion,
  getPostsByTag,
  getPostsByTagId,
  getPostSlugs,
  getPublishedPosts,
  validatePostCollection,
  type Post,
} from "@/lib/posts";
import { createTaxonomy, tagFromSlug, tagPresentation } from "@/lib/tags";
import {
  canonicalTagSlug,
  decodeTagPathSegment,
  encodeTagSlug,
} from "@/lib/tag-route";
import { tagPath } from "@/lib/inventory";

const DIR = path.join(__dirname, "fixtures", "multilingual");
const present = (label: string, slug = label) => ({ label, slug });
const TAXONOMY = createTaxonomy([
  {
    id: "distributed-systems",
    locales: {
      en: present("distributed-systems"),
      "pt-BR": present("sistemas distribuídos", "sistemas-distribuidos"),
    },
  },
  { id: "meta", locales: { en: present("meta") } },
]);

const all = () => getAllPosts(DIR, TAXONOMY);
const post = (over: Partial<Post>): Post => ({
  slug: "a",
  contentId: "work",
  locale: "en",
  originalLocale: "en",
  title: "A",
  description: "d",
  publishedAt: "2026-01-01",
  tags: [],
  draft: false,
  ...over,
});
const problems = (posts: Post[], taxonomy = TAXONOMY) => {
  try {
    validatePostCollection(posts, taxonomy);
    return "";
  } catch (error) {
    return (error as Error).message;
  }
};

describe("one work, several localized versions", () => {
  it("C: an English original and a Portuguese translation share contentId with different slugs", () => {
    const en = getPostBySlug("en", "english-original", DIR, TAXONOMY)!;
    const pt = getPostBySlug("pt-BR", "trabalho-traduzido", DIR, TAXONOMY)!;
    expect([en.contentId, pt.contentId]).toEqual(["same-work", "same-work"]);
    expect([en.slug, pt.slug]).toEqual([
      "english-original",
      "trabalho-traduzido",
    ]);
    expect(findPostVersion(all(), "same-work", "pt-BR")).toEqual(pt);
    expect(getPostVersion("same-work", "en", DIR, TAXONOMY)).toEqual(en);
  });

  it("L: relationship comes from contentId, not from filename or slug", () => {
    // No slug is shared or similar, yet both are versions of one work.
    expect(
      all()
        .filter((p) => p.contentId === "same-work")
        .map((p) => p.slug)
        .sort(),
    ).toEqual(["english-original", "trabalho-traduzido"]);
    // A slug in the wrong locale is not found: no slug guessing, no fallback.
    expect(
      getPostBySlug("pt-BR", "english-original", DIR, TAXONOMY),
    ).toBeNull();
    expect(getPostBySlug("en", "trabalho-traduzido", DIR, TAXONOMY)).toBeNull();
  });

  it("A/B/E: English-only and Portuguese-only works are valid, and a missing counterpart is undefined", () => {
    expect(getPostVersion("only-en", "en", DIR, TAXONOMY)).toBeDefined();
    expect(getPostVersion("only-en", "pt-BR", DIR, TAXONOMY)).toBeUndefined();
    expect(
      getPostVersion("only-pt", "pt-BR", DIR, TAXONOMY)?.originalLocale,
    ).toBe("pt-BR");
    expect(getPostVersion("only-pt", "en", DIR, TAXONOMY)).toBeUndefined();
  });

  it("D: a Portuguese original with an English translation", () => {
    const en = getPostVersion("pt-first", "en", DIR, TAXONOMY)!;
    const pt = getPostVersion("pt-first", "pt-BR", DIR, TAXONOMY)!;
    expect([en.originalLocale, pt.originalLocale]).toEqual(["pt-BR", "pt-BR"]);
    expect(pt.locale).toBe(pt.originalLocale);
  });

  it("K/14: a translation keeps its original's publication date and its own update", () => {
    const en = getPostVersion("same-work", "en", DIR, TAXONOMY)!;
    const pt = getPostVersion("same-work", "pt-BR", DIR, TAXONOMY)!;
    expect([en.publishedAt, en.updatedAt]).toEqual([
      "2026-02-01",
      "2026-02-10",
    ]);
    expect([pt.publishedAt, pt.updatedAt]).toEqual(["2026-02-01", undefined]);
  });

  it("13/I: drafts are per version", () => {
    expect(
      getPublishedPosts("en", DIR, TAXONOMY).map((p) => p.contentId),
    ).toContain("draft-pt");
    expect(
      getPublishedPosts("pt-BR", DIR, TAXONOMY).map((p) => p.contentId),
    ).not.toContain("draft-pt");
    expect(getPostVersion("draft-pt", "pt-BR", DIR, TAXONOMY)?.draft).toBe(
      true,
    );
  });

  it("J/10: a withdrawn original keeps its provenance while a translation stays public", () => {
    const original = getPostVersion("example", "en", DIR, TAXONOMY)!;
    expect(original.draft).toBe(true);
    expect(original.originalLocale).toBe("en");
    expect(
      getPublishedPosts("en", DIR, TAXONOMY).map((p) => p.contentId),
    ).not.toContain("example");
    const pt = getPublishedPosts("pt-BR", DIR, TAXONOMY).find(
      (p) => p.contentId === "example",
    )!;
    expect(pt.originalLocale).toBe("en"); // identity is not reassigned to Portuguese
  });
});

describe("collection validation", () => {
  it("accepts the fixture collection", () => {
    expect(all()).toHaveLength(10);
  });

  it("F: rejects two versions of one work in one locale", () => {
    const message = problems([post({ slug: "a" }), post({ slug: "b" })]);
    expect(message).toMatch(
      /contentId "work" has two en versions: "a" and "b"/,
    );
  });

  it("G: rejects versions that disagree on originalLocale", () => {
    const message = problems([
      post({ slug: "a" }),
      post({ slug: "b", locale: "pt-BR", originalLocale: "pt-BR" }),
    ]);
    expect(message).toMatch(/disagree on originalLocale/);
  });

  it("rejects versions of one work that disagree on publishedAt", () => {
    const message = problems([
      post({ slug: "a", publishedAt: "2026-02-01" }),
      post({
        slug: "b",
        locale: "pt-BR",
        publishedAt: "2026-03-05",
      }),
    ]);
    expect(message).toMatch(
      /contentId "work" versions disagree on publishedAt: "a" says 2026-02-01, "b" says 2026-03-05/,
    );
  });

  it("accepts a draft translation that shares its original's date", () => {
    expect(
      problems([
        post({ slug: "a", publishedAt: "2026-02-01" }),
        post({
          slug: "b",
          locale: "pt-BR",
          publishedAt: "2026-02-01",
          draft: true,
        }),
      ]),
    ).toBe("");
  });

  it("H: rejects a claimed original with no provenance record, never inferring it", () => {
    const message = problems([
      post({ slug: "b", locale: "pt-BR", originalLocale: "en" }),
    ]);
    expect(message).toMatch(/claims originalLocale en but has no en version/);
  });

  it("rejects an invalid contentId or locale", () => {
    expect(problems([post({ contentId: "Not Valid" })])).toMatch(
      /invalid contentId "Not Valid"/,
    );
    expect(
      problems([
        post({ locale: "fr" as never, originalLocale: "fr" as never }),
      ]),
    ).toMatch(/unsupported locale "fr"/);
  });

  it("accepts a draft original with a published translation", () => {
    expect(
      problems([
        post({ slug: "a", draft: true }),
        post({ slug: "b", locale: "pt-BR", originalLocale: "en" }),
      ]),
    ).toBe("");
  });

  it("rejects a slug used twice in one locale", () => {
    expect(
      problems([post({ contentId: "x" }), post({ contentId: "y" })]),
    ).toMatch(/slug "a" in en is used by both/);
  });
});

describe("locale-safe selection", () => {
  it("returns one locale at a time and never falls back", () => {
    expect(
      getPublishedPosts("en", DIR, TAXONOMY).every((p) => p.locale === "en"),
    ).toBe(true);
    expect(
      getPublishedPosts("pt-BR", DIR, TAXONOMY).every(
        (p) => p.locale === "pt-BR",
      ),
    ).toBe(true);
    expect(getPostSlugs("pt-BR", DIR, TAXONOMY)).not.toContain(
      "english-original",
    );
  });

  it("related excludes the same work and other languages", () => {
    const en = post({ slug: "e", contentId: "w", tags: ["meta"] });
    const pt = post({
      slug: "p",
      contentId: "w",
      locale: "pt-BR",
      tags: ["meta"],
    });
    const other = post({ slug: "o", contentId: "o", tags: ["meta"] });
    const otherPt = post({
      slug: "q",
      contentId: "q",
      locale: "pt-BR",
      tags: ["meta"],
    });
    expect(
      relatedPosts(en, [en, pt, other, otherPt]).map((p) => p.slug),
    ).toEqual(["o"]);
  });

  it("previous and next stay within the language, published only", () => {
    const a = post({ slug: "a", contentId: "a", publishedAt: "2026-01-01" });
    const b = post({ slug: "b", contentId: "b", publishedAt: "2026-02-01" });
    const c = post({ slug: "c", contentId: "c", publishedAt: "2026-03-01" });
    const pt = post({
      slug: "p",
      contentId: "p",
      locale: "pt-BR",
      publishedAt: "2026-02-15",
    });
    const hidden = post({
      slug: "h",
      contentId: "h",
      publishedAt: "2026-02-20",
      draft: true,
    });
    const n = chronologicalNeighbours(b, [a, b, c, pt, hidden]);
    expect([n.previous?.slug, n.next?.slug]).toEqual(["a", "c"]);
  });
});

describe("tags: id, label and slug are separate", () => {
  it("resolves the same tag by its English and Portuguese slugs", () => {
    expect(tagFromSlug("en", "distributed-systems", TAXONOMY)?.id).toBe(
      "distributed-systems",
    );
    expect(tagFromSlug("pt-BR", "sistemas-distribuidos", TAXONOMY)).toEqual({
      id: "distributed-systems",
      label: "sistemas distribuídos",
      slug: "sistemas-distribuidos",
    });
    expect(
      tagFromSlug("pt-BR", "distributed-systems", TAXONOMY),
    ).toBeUndefined();
  });

  it("filters by id and routes by the locale's slug, within one locale", () => {
    expect(
      getPostsByTagId("en", "distributed-systems", DIR, TAXONOMY).map(
        (p) => p.slug,
      ),
    ).toEqual(["english-original"]);
    expect(
      getPostsByTag("pt-BR", "sistemas-distribuidos", DIR, TAXONOMY)
        .map((p) => p.slug)
        .sort(),
    ).toEqual(["so-portugues", "trabalho-traduzido"]);
    expect(getPostsByTag("en", "sistemas-distribuidos", DIR, TAXONOMY)).toEqual(
      [],
    );
  });

  it("encodes a Unicode and reserved-character slug once and resolves its canonical record", () => {
    const encoded = createTaxonomy([
      {
        id: "encoded-topic",
        locales: {
          en: present("encoded topic", "café+c#"),
          "pt-BR": present("tópico codificado", "café+pt#"),
        },
      },
    ]);

    expect(tagFromSlug("en", "CAFÉ+C#", encoded)).toEqual({
      id: "encoded-topic",
      label: "encoded topic",
      slug: "café+c#",
    });
    expect(tagFromSlug("pt-BR", "café+pt#", encoded)).toEqual({
      id: "encoded-topic",
      label: "tópico codificado",
      slug: "café+pt#",
    });
    expect(tagFromSlug("pt-BR", "CAFÉ+PT#", encoded)).toBeUndefined();
    expect(tagPath("en", "café+c#")).toBe("/tags/caf%C3%A9%2Bc%23");
    expect(tagPath("pt-BR", "café+pt#")).toBe("/pt/tags/caf%C3%A9%2Bpt%23");
  });

  it("uses a single safe decode with deterministic Unicode normalization", () => {
    expect(decodeTagPathSegment("caf%C3%A9%2Bc%23")).toBe("café+c#");
    expect(decodeTagPathSegment("cafe%CC%81%2Bc%23")).toBe("café+c#");
    expect(encodeTagSlug("café+c#")).toBe("caf%C3%A9%2Bc%23");

    for (const segment of ["x%2Fy", "x%5Cy", "x%252Fy", "%E0%A4%A"]) {
      expect(decodeTagPathSegment(segment)).toBeUndefined();
    }
    expect(() => canonicalTagSlug("x/y")).toThrow(/Invalid canonical/);
    expect(() => canonicalTagSlug("x%2Fy")).toThrow(/Invalid canonical/);
    expect(() => canonicalTagSlug("cafe\u0301")).toThrow(/Invalid canonical/);
  });

  it("counts a locale's tags in that locale's words", () => {
    expect(getAllTags("pt-BR", DIR, TAXONOMY)).toEqual([
      {
        id: "distributed-systems",
        label: "sistemas distribuídos",
        slug: "sistemas-distribuidos",
        count: 2,
      },
    ]);
  });

  it("fails a post whose tag has no presentation in its locale, with no English fallback", () => {
    const message = problems([
      post({ locale: "pt-BR", originalLocale: "pt-BR", tags: ["meta"] }),
    ]);
    expect(message).toMatch(/tag "meta" is not defined for locale pt-BR/);
    expect(() => tagPresentation("meta", "pt-BR", TAXONOMY)).toThrow(
      /no presentation for locale pt-BR/,
    );
    expect(problems([post({ tags: ["unknown-tag"] })])).toMatch(
      /tag "unknown-tag" is not defined for locale en/,
    );
  });

  it("rejects a slug collision within a locale and an invalid slug", () => {
    expect(() =>
      createTaxonomy([
        { id: "a", locales: { en: present("a", "same") } },
        { id: "b", locales: { en: present("b", "same") } },
      ]),
    ).toThrow(/slug "same" in en is used by both "a" and "b"/);
    expect(() =>
      createTaxonomy([{ id: "a", locales: { en: present("a", "Not Valid") } }]),
    ).toThrow(/invalid canonical slug/);
    expect(() =>
      createTaxonomy([
        { id: "a", locales: { en: present("a", "Mixed") } },
        { id: "b", locales: { en: present("b", "mixed") } },
      ]),
    ).toThrow(/used by both "a" and "b"/);
    // The same slug in different locales is fine.
    expect(() =>
      createTaxonomy([
        {
          id: "a",
          locales: { en: present("a", "x"), "pt-BR": present("a", "x") },
        },
      ]),
    ).not.toThrow();
  });
});

describe("series are keyed by contentId", () => {
  it("covers a translated part through its work, not its slug or tags", () => {
    const id = "started-writing-down-the-failures-before-the-features";
    const en = post({ slug: id, contentId: id });
    const pt = post({
      slug: "comecei-a-escrever-as-falhas-antes-das-funcionalidades",
      contentId: id,
      locale: "pt-BR",
    });
    expect(seriesOf(en)?.name).toBe("jobs-mcp");
    expect(seriesOf(pt)?.name).toBe("jobs-mcp");
    expect(
      seriesOf(
        post({
          slug: id,
          contentId: "unrelated",
          tags: ["osdev"],
        }),
      ),
    ).toBeUndefined();
  });

  it("keeps today's only series and their order, every part a real work", () => {
    expect(series.map((s) => [s.name, s.contentIds])).toEqual([
      [
        "jobs-mcp",
        [
          "started-writing-down-the-failures-before-the-features",
          "gave-one-operation-more-than-one-deadline",
        ],
      ],
    ]);
    const real = new Set(getPublishedPosts("en").map((p) => p.contentId));
    for (const item of series)
      for (const id of item.contentIds) expect(real.has(id)).toBe(true);
  });
});
