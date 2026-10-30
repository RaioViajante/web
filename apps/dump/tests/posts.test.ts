import path from "node:path";

import { createTaxonomy, tagDefinitions } from "@/lib/tags";
import { RECORDED_BEFORE_UPDATE, VERIFIED_UPDATES } from "./verified-updates";
import {
  formatPostDate,
  getAllPosts,
  getAllTags,
  getPostBySlug,
  getPostSlugs,
  getPostsByTag,
  getPublishedPosts,
  parseFrontmatter,
  slugFromFilename,
  sortPostsNewestFirst,
} from "@/lib/posts";

/** The production taxonomy plus the one tag only the fixtures use. */
const TAXONOMY = createTaxonomy([
  ...tagDefinitions,
  { id: "testing", locales: { en: { label: "testing", slug: "testing" } } },
]);
const FIXTURES = path.join(__dirname, "fixtures", "posts");
const EMPTY = path.join(__dirname, "fixtures", "no-such-directory");

describe("parseFrontmatter", () => {
  const valid = {
    contentId: "a-title",
    locale: "en",
    originalLocale: "en",
    title: "A Title",
    description: "A description.",
    publishedAt: "2026-09-03",
    tags: ["OSDev", " x86 "],
  };

  it("normalizes tags to trimmed lowercase and defaults draft to false", () => {
    expect(parseFrontmatter(valid, "x")).toEqual({
      contentId: "a-title",
      locale: "en",
      originalLocale: "en",
      title: "A Title",
      description: "A description.",
      publishedAt: "2026-09-03",
      tags: ["osdev", "x86"],
      draft: false,
    });
  });

  it("defaults missing tags to an empty array", () => {
    const { tags } = parseFrontmatter({ ...valid, tags: undefined }, "x");
    expect(tags).toEqual([]);
  });

  it.each([
    ["missing contentId", { ...valid, contentId: undefined }],
    ["contentId that is not an identifier", { ...valid, contentId: "A Title" }],
    ["missing locale", { ...valid, locale: undefined }],
    ["unsupported locale", { ...valid, locale: "fr" }],
    ["missing originalLocale", { ...valid, originalLocale: undefined }],
    ["unsupported originalLocale", { ...valid, originalLocale: "fr" }],
    ["missing title", { ...valid, title: undefined }],
    ["empty title", { ...valid, title: "  " }],
    ["missing description", { ...valid, description: undefined }],
    ["missing publication date", { ...valid, publishedAt: undefined }],
    [
      "legacy date without publication date",
      { ...valid, publishedAt: undefined, date: "2026-09-03" },
    ],
    ["malformed publication date", { ...valid, publishedAt: "Sept 3 2026" }],
    ["impossible month", { ...valid, publishedAt: "2026-13-01" }],
    ["impossible day", { ...valid, publishedAt: "2026-02-29" }],
    ["year zero", { ...valid, publishedAt: "0000-01-01" }],
    ["malformed update date", { ...valid, updatedAt: "October 5, 2026" }],
    ["impossible update date", { ...valid, updatedAt: "2026-02-30" }],
    ["update on publication date", { ...valid, updatedAt: "2026-09-03" }],
    ["update before publication", { ...valid, updatedAt: "2026-09-02" }],
    ["non-string tags", { ...valid, tags: "osdev" }],
    ["tag that is not URL-safe", { ...valid, tags: ["c++"] }],
    ["non-boolean draft", { ...valid, draft: "yes" }],
    ["not an object", "nope"],
  ])("throws on %s", (_label, input) => {
    expect(() => parseFrontmatter(input, "broken")).toThrow(/broken\.mdx/);
  });

  it("accepts an optional update date later than publication", () => {
    expect(
      parseFrontmatter({ ...valid, updatedAt: "2026-10-05" }, "x"),
    ).toMatchObject({
      publishedAt: "2026-09-03",
      updatedAt: "2026-10-05",
    });
  });

  it("accepts a real leap day", () => {
    expect(
      parseFrontmatter({ ...valid, publishedAt: "2028-02-29" }, "x"),
    ).toHaveProperty("publishedAt", "2028-02-29");
  });
});

describe("slugFromFilename", () => {
  it("uses the filename (without extension) as the slug", () => {
    expect(slugFromFilename("my-first-boot-sector.mdx")).toBe(
      "my-first-boot-sector",
    );
  });

  it.each([
    "My Post.mdx",
    "UPPER.mdx",
    "trailing-.mdx",
    "under_score.mdx",
    "../escape.mdx",
    "no-extension",
  ])("rejects %s", (filename) => {
    expect(() => slugFromFilename(filename)).toThrow(/Invalid post filename/);
  });
});

describe("post collection", () => {
  it("returns every file, newest first", () => {
    expect(getAllPosts(FIXTURES, TAXONOMY).map((p) => p.slug)).toEqual([
      "hidden-post",
      "second-post",
      "first-post",
    ]);
  });

  it("preserves same-day ordering by title", () => {
    const posts = [
      { ...getAllPosts(FIXTURES, TAXONOMY)[0]!, title: "Zulu", slug: "zulu" },
      { ...getAllPosts(FIXTURES, TAXONOMY)[0]!, title: "Alpha", slug: "alpha" },
    ];
    expect(sortPostsNewestFirst(posts).map((post) => post.slug)).toEqual([
      "alpha",
      "zulu",
    ]);
  });

  it("preserves every published slug and historical publication date", () => {
    expect(
      Object.fromEntries(
        getPublishedPosts("en").map((post) => [post.slug, post.publishedAt]),
      ),
    ).toEqual({
      "gave-one-operation-more-than-one-deadline": "2026-09-27",
      "kept-building-and-stopped-writing-it-down": "2026-09-27",
      "maybe-this-can-be-something-someday": "2026-09-04",
      "my-project-cards-were-getting-ahead-of-my-projects": "2026-09-27",
      "split-my-internet-into-four-different-kinds-of-place": "2026-09-13",
      "started-designing-a-language-before-i-could-compile-one": "2026-09-13",
      "started-writing-down-the-failures-before-the-features": "2026-09-27",
      "there-is-no-printf-down-here": "2026-09-05",
      "for-those-who-never-quite-belonged": "2026-10-30",
      // The English translation of the Portuguese original keeps its date.
      "translating-the-site-without-pretending-everything-already-exists":
        "2026-10-19",
    });
  });

  it("records an update date only for the verified material updates, on every version", () => {
    for (const locale of ["en", "pt-BR"] as const) {
      expect(
        getPublishedPosts(locale)
          .filter((post) => post.updatedAt)
          .map(({ contentId, updatedAt }) => ({ contentId, updatedAt }))
          .sort((a, b) => a.contentId.localeCompare(b.contentId)),
      ).toEqual(
        Object.entries(VERIFIED_UPDATES)
          .map(([contentId, updatedAt]) => ({ contentId, updatedAt }))
          .sort((a, b) => a.contentId.localeCompare(b.contentId)),
      );
    }
    // The update is later than the earlier recorded one and than publication.
    expect(
      VERIFIED_UPDATES[
        "split-my-internet-into-four-different-kinds-of-place"
      ]! > RECORDED_BEFORE_UPDATE,
    ).toBe(true);
  });

  it("derives the slug from the filename", () => {
    expect(getPostBySlug("en", "first-post", FIXTURES, TAXONOMY)?.title).toBe(
      "First Post",
    );
    expect(
      getPostBySlug("en", "does-not-exist", FIXTURES, TAXONOMY),
    ).toBeNull();
  });

  it("excludes drafts from the published set", () => {
    expect(
      getPublishedPosts("en", FIXTURES, TAXONOMY).map((p) => p.slug),
    ).toEqual(["second-post", "first-post"]);
  });

  it("never gives drafts a prerendered route", () => {
    expect(getPostSlugs("en", FIXTURES, TAXONOMY)).toEqual([
      "second-post",
      "first-post",
    ]);
  });

  it("treats a missing content directory as no posts", () => {
    expect(getAllPosts(EMPTY, TAXONOMY)).toEqual([]);
    expect(getPublishedPosts("en", EMPTY)).toEqual([]);
    expect(getAllTags("en", EMPTY)).toEqual([]);
    expect(getPostBySlug("en", "anything", EMPTY)).toBeNull();
  });
});

describe("tags", () => {
  it("counts tags across published posts only, most used first", () => {
    expect(getAllTags("en", FIXTURES, TAXONOMY)).toEqual([
      { id: "osdev", label: "osdev", slug: "osdev", count: 2 },
      { id: "testing", label: "testing", slug: "testing", count: 1 },
      { id: "x86", label: "x86", slug: "x86", count: 1 },
    ]);
  });

  it("looks posts up by tag, newest first, drafts excluded", () => {
    expect(
      getPostsByTag("en", "osdev", FIXTURES, TAXONOMY).map((p) => p.slug),
    ).toEqual(["second-post", "first-post"]);
  });
});

describe("formatPostDate", () => {
  it("formats an ISO date without timezone drift", () => {
    expect(formatPostDate("2026-09-03")).toBe("September 3, 2026");
  });

  it("does not roll back across the UTC date line", () => {
    // A naive `new Date("2026-01-01")` in a negative-offset zone renders as
    // Dec 31. This must stay January 1 everywhere.
    expect(formatPostDate("2026-01-01")).toBe("January 1, 2026");
  });

  it("formats Portuguese dates through the locale registry", () => {
    expect(formatPostDate("2026-09-03", "pt-BR")).toBe("3 de setembro de 2026");
  });
});
