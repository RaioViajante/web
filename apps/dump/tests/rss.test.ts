import { renderRssFeed } from "@/lib/rss";
import type { Post } from "@/lib/posts";

const posts: Post[] = [
  {
    slug: "second",
    contentId: "second",
    locale: "en",
    originalLocale: "en",
    title: "Second & Newest",
    description: 'Has an ampersand and a "quote".',
    publishedAt: "2026-05-20",
    updatedAt: "2026-06-01",
    tags: ["osdev"],
    draft: false,
  },
  {
    slug: "first",
    contentId: "first",
    locale: "en",
    originalLocale: "en",
    title: "First Post",
    description: "Plain description.",
    publishedAt: "2026-01-15",
    tags: [],
    draft: false,
  },
];

describe("renderRssFeed", () => {
  const feed = renderRssFeed(posts);

  it("produces a well-formed RSS 2.0 document", () => {
    expect(feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(
      true,
    );
    expect(feed).toContain('<rss version="2.0"');
    expect(feed.trimEnd().endsWith("</rss>")).toBe(true);
    expect((feed.match(/<item>/g) ?? []).length).toBe(2);
  });

  it("escapes XML-significant characters in content", () => {
    expect(feed).toContain("<title>Second &amp; Newest</title>");
    expect(feed).toContain("&quot;quote&quot;");
    expect(feed).not.toMatch(/description>[^<]*&(?!amp;|quot;|lt;|gt;|apos;)/);
  });

  it("emits RFC-822 pubDate and permalink guid", () => {
    expect(feed).toContain("<pubDate>Wed, 20 May 2026 00:00:00 GMT</pubDate>");
    expect(feed).toContain('<guid isPermaLink="true">');
    expect(feed).toContain("/posts/first</link>");
  });

  it("keeps publication as pubDate when a post has been updated", () => {
    expect(feed).toContain("<pubDate>Wed, 20 May 2026 00:00:00 GMT</pubDate>");
    expect(feed).not.toContain("Mon, 01 Jun 2026 00:00:00 GMT");
  });

  it("keeps items in the order they were given (already sorted upstream)", () => {
    expect(feed.indexOf("/posts/second")).toBeLessThan(
      feed.indexOf("/posts/first"),
    );
  });

  it("uses absolute URLs", () => {
    for (const url of feed.match(/<link>([^<]+)<\/link>/g) ?? []) {
      expect(url).toMatch(/<link>https?:\/\//);
    }
  });

  it("is still valid with no posts", () => {
    const empty = renderRssFeed([]);
    expect(empty.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(
      true,
    );
    expect(empty).toContain("<channel>");
    expect(empty).toContain("</channel>");
    expect(empty).not.toContain("<item>");
  });
});
