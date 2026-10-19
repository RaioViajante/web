/** @jest-environment node */
import sitemap from "@/app/sitemap";
import { GET as searchIndex } from "@/app/search-index.json/route";
import { renderRssFeed } from "@/lib/rss";
import { getAllPosts, getAllTags, getPublishedPosts } from "@/lib/posts";
import contract from "./fixtures/english-contract.json";

// The English public contract as it stood before the multilingual content
// model: recorded from the frontmatter once, then required to stay. A
// migration invariant, not a rule that a contentId equals its slug.
describe("current English content", () => {
  const published = getPublishedPosts("en");

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
    const tags = getAllTags("en");
    expect(tags.map(({ id, count }) => ({ tag: id, count }))).toEqual(
      contract.tags,
    );
    expect(tags.map((t) => `/tags/${encodeURIComponent(t.slug)}`)).toEqual(
      contract.tagUrls,
    );
    expect(tags.every((t) => t.id === t.label && t.id === t.slug)).toBe(true);
  });

  it("was migrated once: every post is English, original English, contentId equal to its previous slug", () => {
    const english = getAllPosts().filter((post) => post.locale === "en");
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
    const feed = renderRssFeed(published);
    const guids = [...feed.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map(
      (m) => m[1],
    );
    const links = [
      ...feed.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g),
    ].map((m) => m[1]);
    // The origin differs by environment; the identity is the path after it.
    const paths = (urls: (string | undefined)[]) =>
      urls.map((url) => new URL(url!).pathname);
    expect(paths(guids)).toEqual(contract.postUrls);
    expect(paths(links)).toEqual(contract.postUrls);
    const pubDates = [...feed.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map(
      (m) => m[1],
    );
    expect(pubDates).toEqual(
      contract.posts.map((p) =>
        new Date(`${p.publishedAt}T00:00:00Z`).toUTCString(),
      ),
    );
  });

  it("keeps the sitemap post and tag URLs and the search index entries", async () => {
    const paths = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(paths.filter((p) => p.startsWith("/posts/"))).toEqual(
      contract.postUrls,
    );
    expect(paths.filter((p) => p.startsWith("/tags/"))).toEqual(
      contract.tagUrls,
    );
    const entries = (await searchIndex().json()) as Array<{
      href: string;
      site: string;
      locale: string;
    }>;
    expect(entries.map((e) => new URL(e.href).pathname)).toEqual(
      contract.postUrls,
    );
    expect(entries.every((e) => e.site === "dump" && e.locale === "en")).toBe(
      true,
    );
  });

  it("keeps each search body exactly as before the identity fields were added", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const entries = (await searchIndex().json()) as Array<{ body: string }>;
    for (const [index, post] of published.entries()) {
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
      expect(entries[index]!.body).not.toMatch(/originalLocale|contentId/);
    }
  });
});
