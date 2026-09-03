import path from "node:path";

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
} from "@/lib/posts";

const FIXTURES = path.join(__dirname, "fixtures", "posts");
const EMPTY = path.join(__dirname, "fixtures", "no-such-directory");

describe("parseFrontmatter", () => {
  const valid = {
    title: "A Title",
    description: "A description.",
    date: "2026-09-03",
    tags: ["OSDev", " x86 "],
  };

  it("normalizes tags to trimmed lowercase and defaults draft to false", () => {
    expect(parseFrontmatter(valid, "x")).toEqual({
      title: "A Title",
      description: "A description.",
      date: "2026-09-03",
      tags: ["osdev", "x86"],
      draft: false,
    });
  });

  it("defaults missing tags to an empty array", () => {
    const { tags } = parseFrontmatter({ ...valid, tags: undefined }, "x");
    expect(tags).toEqual([]);
  });

  it.each([
    ["missing title", { ...valid, title: undefined }],
    ["empty title", { ...valid, title: "  " }],
    ["missing description", { ...valid, description: undefined }],
    ["malformed date", { ...valid, date: "Sept 3 2026" }],
    ["impossible date", { ...valid, date: "2026-13-40" }],
    ["non-string tags", { ...valid, tags: "osdev" }],
    ["tag that is not URL-safe", { ...valid, tags: ["c++"] }],
    ["non-boolean draft", { ...valid, draft: "yes" }],
    ["not an object", "nope"],
  ])("throws on %s", (_label, input) => {
    expect(() => parseFrontmatter(input, "broken")).toThrow(/broken\.mdx/);
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
    expect(getAllPosts(FIXTURES).map((p) => p.slug)).toEqual([
      "hidden-post",
      "second-post",
      "first-post",
    ]);
  });

  it("derives the slug from the filename", () => {
    expect(getPostBySlug("first-post", FIXTURES)?.title).toBe("First Post");
    expect(getPostBySlug("does-not-exist", FIXTURES)).toBeNull();
  });

  it("excludes drafts from the published set", () => {
    expect(getPublishedPosts(FIXTURES).map((p) => p.slug)).toEqual([
      "second-post",
      "first-post",
    ]);
  });

  it("keeps drafts prerenderable outside production so they can be previewed", () => {
    expect(getPostSlugs(FIXTURES)).toContain("hidden-post");
  });

  it("treats a missing content directory as no posts", () => {
    expect(getAllPosts(EMPTY)).toEqual([]);
    expect(getPublishedPosts(EMPTY)).toEqual([]);
    expect(getAllTags(EMPTY)).toEqual([]);
    expect(getPostBySlug("anything", EMPTY)).toBeNull();
  });
});

describe("rendering fixture", () => {
  it("is valid draft metadata recognized by the content pipeline", () => {
    expect(getPostBySlug("rendering-test")).toMatchObject({
      slug: "rendering-test",
      title: "Rendering Test",
      draft: true,
    });
  });

  it("is excluded from published posts and production static params", () => {
    expect(getPublishedPosts().map((post) => post.slug)).not.toContain(
      "rendering-test",
    );

    const nodeEnv = jest.replaceProperty(process.env, "NODE_ENV", "production");
    try {
      expect(getPostSlugs()).not.toContain("rendering-test");
    } finally {
      nodeEnv.restore();
    }
  });
});

describe("tags", () => {
  it("counts tags across published posts only, most used first", () => {
    expect(getAllTags(FIXTURES)).toEqual([
      { tag: "osdev", count: 2 },
      { tag: "testing", count: 1 },
      { tag: "x86", count: 1 },
    ]);
  });

  it("looks posts up by tag, newest first, drafts excluded", () => {
    expect(getPostsByTag("osdev", FIXTURES).map((p) => p.slug)).toEqual([
      "second-post",
      "first-post",
    ]);
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
});
