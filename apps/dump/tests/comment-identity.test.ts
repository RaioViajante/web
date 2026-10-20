/** @jest-environment node */
import {
  identityProblems,
  strictMarker,
  type DiscussionSnapshot,
} from "@/lib/comment-identity";
import {
  GISCUS,
  commentKey,
  giscusLang,
  legacyPathnameTerm,
} from "@/lib/comment-key";
import { getAllPosts, getPublishedPosts } from "@/lib/posts";
import snapshotJson from "./fixtures/giscus-discussions-snapshot.json";

const snapshot = snapshotJson as DiscussionSnapshot;
const clone = (): DiscussionSnapshot => structuredClone(snapshot);

describe("commentKey", () => {
  it("is posts/<contentId>", () => {
    expect(commentKey("some-work")).toBe("posts/some-work");
  });

  it("is equal across the translated versions of one work", () => {
    const posts = getAllPosts();
    const translated = posts.find(
      (p) => p.locale === "pt-BR" && p.originalLocale === "en",
    )!;
    const original = posts.find(
      (p) => p.locale === "en" && p.contentId === translated.contentId,
    )!;
    expect(translated.slug).not.toBe(original.slug);
    expect(translated.title).not.toBe(original.title);
    expect(commentKey(translated.contentId)).toBe(
      commentKey(original.contentId),
    );
  });

  it("takes nothing but the contentId", () => {
    expect(commentKey.length).toBe(1);
  });

  it("equals the legacy pathname term of every published English post", () => {
    for (const post of getPublishedPosts("en"))
      expect(commentKey(post.contentId)).toBe(legacyPathnameTerm(post.slug));
  });
});

describe("giscus interface language", () => {
  it("uses the language giscus supports for each locale", () => {
    expect(giscusLang("en")).toBe("en");
    // giscus has a single Portuguese interface, "pt"; it has no "pt-BR".
    expect(giscusLang("pt-BR")).toBe("pt");
  });
});

describe("recorded discussion snapshot", () => {
  it("proves the identity of every existing discussion", () => {
    expect(identityProblems(snapshot)).toEqual([]);
  });

  it("records Discussion #14 with its exact identity and comment", () => {
    const d = snapshot.discussions.find((x) => x.number === 14)!;
    expect(d).toMatchObject({
      nodeId: "D_kwDOUu8oYM4AprNS",
      categoryId: GISCUS.categoryId,
      title: "posts/maybe-this-can-be-something-someday",
      contentId: "maybe-this-can-be-something-someday",
      commentCount: 1,
    });
    expect(d.comments).toEqual([
      { nodeId: "DC_kwDOUu8oYM4BHTFa", createdAt: "2026-10-01T02:41:03Z" },
    ]);
  });

  it("matches the strict marker to the SHA-1 of the stable key", () => {
    const d = snapshot.discussions[0]!;
    expect(strictMarker(commentKey(d.contentId))).toBe(d.strictMarker);
    expect(strictMarker(legacyPathnameTerm(d.legacySlug))).toBe(d.strictMarker);
    // A leading slash would be a different identity.
    expect(strictMarker(`/${commentKey(d.contentId)}`)).not.toBe(
      d.strictMarker,
    );
  });

  it("belongs to a work that is still published in English", () => {
    const d = snapshot.discussions[0]!;
    expect(
      getPublishedPosts("en").some(
        (p) => p.contentId === d.contentId && p.slug === d.legacySlug,
      ),
    ).toBe(true);
  });

  it("is a floor: a work without a discussion needs no entry and none is made", () => {
    const withoutDiscussion = getPublishedPosts("en").filter(
      (p) => !snapshot.discussions.some((d) => d.contentId === p.contentId),
    );
    expect(withoutDiscussion.length).toBeGreaterThan(0);
    // The key is still derivable; giscus creates a discussion only when someone comments.
    for (const p of withoutDiscussion)
      expect(commentKey(p.contentId)).toMatch(/^posts\/[a-z0-9-]+$/);
  });
});

describe("identity proof fails closed", () => {
  it("rejects missing evidence", () => {
    expect(identityProblems(undefined)).toEqual([
      expect.stringContaining("unproven"),
    ]);
    expect(identityProblems({ ...clone(), discussions: [] })[0]).toMatch(
      /unproven/,
    );
  });

  it.each([
    [
      "a wrong marker",
      (s: DiscussionSnapshot) =>
        (s.discussions[0]!.strictMarker = "0".repeat(40)),
      /SHA-1/,
    ],
    [
      "a key that differs from the legacy term",
      (s: DiscussionSnapshot) => (s.discussions[0]!.legacySlug = "renamed"),
      /legacy term/,
    ],
    [
      "another category",
      (s: DiscussionSnapshot) => (s.discussions[0]!.categoryId = "DIC_x"),
      /category/,
    ],
    [
      "a lost comment",
      (s: DiscussionSnapshot) => {
        s.discussions[0]!.comments = [];
        s.discussions[0]!.commentCount = 0;
      },
      /lost its comment/,
    ],
    [
      "Discussion #14 missing",
      (s: DiscussionSnapshot) => (s.discussions[0]!.number = 15),
      /#14 is missing/,
    ],
    [
      "an incomplete inventory",
      (s: DiscussionSnapshot) => (s.repository.discussionsTotal = 2),
      /repository has 2/,
    ],
  ])("rejects %s", (_name, mutate, expected) => {
    const broken = clone();
    mutate(broken);
    expect(identityProblems(broken).join("\n")).toMatch(expected);
  });
});
