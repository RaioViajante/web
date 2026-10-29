/** @jest-environment node */
import sitemap from "@/app/sitemap";
import { GET as searchIndex } from "@/app/search-index.json/route";
import { renderRssFeed } from "@/lib/rss";
import { getAllPosts, getAllTags, getPublishedPosts } from "@/lib/posts";
import { LEGACY_ENGLISH_CONTENT_IDS } from "@/lib/rss-identity";
import contract from "./fixtures/english-contract.json";

// English posts added after the contract was recorded. They are new English
// items (here, the translation of a Portuguese original), not part of the
// frozen pre-migration set; everything else below must stay untouched.
const ADDED_ENGLISH = [
  {
    slug: "translating-the-site-without-pretending-everything-already-exists",
    contentId: "traduzir-o-site-sem-fingir-que-tudo-ja-existe",
    originalLocale: "pt-BR",
    publishedAt: "2026-10-29",
    tags: ["meta", "architecture", "web"],
  },
];
const addedUrls = ADDED_ENGLISH.map(({ slug }) => `/posts/${slug}`);
const isRecorded = (post: { contentId: string }) =>
  LEGACY_ENGLISH_CONTENT_IDS.includes(post.contentId);

// The English public contract as it stood before the multilingual content
// model: recorded from the frontmatter once, then required to stay. A
// migration invariant, not a rule that a contentId equals its slug.
describe("current English content", () => {
  const allPublished = getPublishedPosts("en");
  const published = allPublished.filter(isRecorded);

  it("adds only the reviewed English translation of the Portuguese original", () => {
    expect(
      allPublished
        .filter((post) => !isRecorded(post))
        .map((post) => ({
          slug: post.slug,
          contentId: post.contentId,
          originalLocale: post.originalLocale,
          publishedAt: post.publishedAt,
          tags: post.tags,
        })),
    ).toEqual(ADDED_ENGLISH);
    expect(allPublished.map((post) => post.slug)).toEqual([
      ...ADDED_ENGLISH.map(({ slug }) => slug),
      ...published.map((post) => post.slug),
    ]);
  });

  it("keeps every slug, URL, date, tag list and the publication order", () => {
    expect(
      published.map((p) => ({
        slug: p.slug,
        title: p.title,
        publishedAt: p.publishedAt,
        updatedAt: p.updatedAt ?? null,
        tags: p.tags,
      })),
    ).toEqual(
      contract.posts.map(({ bodyLength, ...rest }) => (void bodyLength, rest)),
    );
    expect(published.map((p) => `/posts/${p.slug}`)).toEqual(contract.postUrls);
  });

  it("keeps tag counts, order and URLs", () => {
    // Counted over the recorded posts: the added translation only adds to
    // the counts of its own tags.
    const counts = new Map<string, number>();
    for (const post of published)
      for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    const recorded = [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    expect(recorded).toEqual(contract.tags);
    const tags = getAllTags("en");
    for (const { id, count } of tags)
      expect(count).toBe(
        (counts.get(id) ?? 0) +
          ADDED_ENGLISH.filter((post) => post.tags.includes(id)).length,
      );
    expect(recorded.map((t) => `/tags/${encodeURIComponent(t.tag)}`)).toEqual(
      contract.tagUrls,
    );
    expect(tags.map((t) => t.id).sort()).toEqual(
      recorded.map((t) => t.tag).sort(),
    );
    expect(tags.every((t) => t.id === t.label && t.id === t.slug)).toBe(true);
  });

  it("was migrated once: every post is English, original English, contentId equal to its previous slug", () => {
    const english = getAllPosts().filter(
      (post) => post.locale === "en" && isRecorded(post),
    );
    expect(english).toHaveLength(contract.posts.length);
    for (const post of english) {
      expect(post.locale).toBe("en");
      expect(post.originalLocale).toBe("en");
      expect(post.contentId).toBe(post.slug);
    }
    expect(english.map((p) => p.slug).sort()).toEqual(
      contract.posts.map((p) => p.slug).sort(),
    );
  });

  it("keeps the RSS items: links, GUIDs and pubDates", () => {
    const feed = renderRssFeed(allPublished);
    const guids = [...feed.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map(
      (m) => m[1],
    );
    const links = [
      ...feed.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g),
    ].map((m) => m[1]);
    // The origin differs by environment; the identity is the path after it.
    const paths = (urls: (string | undefined)[]) =>
      urls.map((url) => new URL(url!).pathname);
    // Recorded items keep their permalink GUIDs, in order; the added
    // translation uses the tag form, so only its link is a path.
    expect(paths(guids.filter((guid) => !guid?.startsWith("tag:")))).toEqual(
      contract.postUrls,
    );
    expect(paths(links)).toEqual([...addedUrls, ...contract.postUrls]);
    const pubDates = [...feed.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map(
      (m) => m[1],
    );
    expect(pubDates.slice(ADDED_ENGLISH.length)).toEqual(
      contract.posts.map((p) =>
        new Date(`${p.publishedAt}T00:00:00Z`).toUTCString(),
      ),
    );
  });

  it("keeps the sitemap post and tag URLs and the search index entries", async () => {
    const paths = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(paths.filter((p) => p.startsWith("/posts/"))).toEqual([
      ...addedUrls,
      ...contract.postUrls,
    ]);
    expect(paths.filter((p) => p.startsWith("/tags/")).sort()).toEqual(
      [...contract.tagUrls].sort(),
    );
    const entries = (await searchIndex().json()) as Array<{
      href: string;
      site: string;
      locale: string;
    }>;
    expect(entries.map((e) => new URL(e.href).pathname)).toEqual([
      ...addedUrls,
      ...contract.postUrls,
    ]);
    expect(entries.every((e) => e.site === "dump" && e.locale === "en")).toBe(
      true,
    );
  });

  it("keeps each search body exactly as before the identity fields were added", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const entries = (await searchIndex().json()) as Array<{ body: string }>;
    for (const [index, post] of allPublished.entries()) {
      const raw = readFileSync(
        join(process.cwd(), "content/posts", `${post.slug}.mdx`),
        "utf8",
      );
      // The pre-migration text is the file minus the three added lines.
      const before = raw.replace(
        /^(?:contentId|locale|originalLocale):.*\n/gm,
        "",
      );
      expect(entries[index]!.body).toBe(
        before.replace(/<[^>]*>|[{][^}]*[}]/g, " "),
      );
      expect(entries[index]!.body).not.toMatch(
        /^(?:contentId|locale|originalLocale):/m,
      );
    }
  });
});
