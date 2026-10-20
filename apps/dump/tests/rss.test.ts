/** @jest-environment node */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { GET as englishFeed } from "@/app/rss.xml/route";
import { GET as portugueseFeed } from "@/app/pt/rss.xml/route";
import { getPublishedPosts, type Post } from "@/lib/posts";
import { renderRssFeed, rssPath } from "@/lib/rss";
import {
  LEGACY_ENGLISH_CONTENT_IDS,
  rssGuid,
  tagGuid,
} from "@/lib/rss-identity";
import { alternatesFor, site } from "@/lib/site";
import { tagPresentation } from "@/lib/tags";

function post(overrides: Partial<Post> = {}): Post {
  return {
    slug: "first",
    contentId: "first",
    locale: "en",
    originalLocale: "en",
    title: "First Post",
    description: "Plain description.",
    publishedAt: "2026-01-15",
    tags: [],
    draft: false,
    ...overrides,
  };
}

const items = (feed: string) =>
  [...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, body = ""]) => ({
    link: body.match(/<link>([^<]*)<\/link>/)?.[1],
    guid: body.match(/<guid[^>]*>([^<]*)<\/guid>/)?.[1],
    permalink: body.match(/<guid isPermaLink="([^"]+)"/)?.[1],
    pubDate: body.match(/<pubDate>([^<]*)<\/pubDate>/)?.[1],
  }));

const only = (feed: string) => items(feed)[0]!;

describe("renderRssFeed", () => {
  const feed = renderRssFeed([
    post({
      slug: "second",
      contentId: "second",
      title: "Second & Newest",
      description: 'Has an ampersand and a "quote".',
      publishedAt: "2026-05-20",
      updatedAt: "2026-06-01",
      tags: ["osdev"],
    }),
    post(),
  ]);

  it("produces a well-formed RSS 2.0 document", () => {
    expect(feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(
      true,
    );
    expect(feed).toContain('<rss version="2.0"');
    expect(feed.trimEnd().endsWith("</rss>")).toBe(true);
    expect(items(feed)).toHaveLength(2);
  });

  it("escapes XML-significant characters in content", () => {
    expect(feed).toContain("<title>Second &amp; Newest</title>");
    expect(feed).toContain("&quot;quote&quot;");
    expect(feed).not.toMatch(/description>[^<]*&(?!amp;|quot;|lt;|gt;|apos;)/);
  });

  it("emits RFC-822 pubDate from publication, not update, date", () => {
    expect(feed).toContain("<pubDate>Wed, 20 May 2026 00:00:00 GMT</pubDate>");
    expect(feed).not.toContain("Mon, 01 Jun 2026 00:00:00 GMT");
  });

  it("keeps items in the order they were given (already sorted upstream)", () => {
    expect(feed.indexOf("/posts/second")).toBeLessThan(
      feed.indexOf("/posts/first"),
    );
  });

  it("uses absolute URLs", () => {
    for (const { link } of items(feed)) expect(link).toMatch(/^https?:\/\//);
  });

  it("is still valid with no posts", () => {
    const empty = renderRssFeed([]);
    expect(empty).toContain("<channel>");
    expect(empty).toContain("</channel>");
    expect(empty).not.toContain("<item>");
  });
});

describe("GUID policy", () => {
  it("keeps a legacy English post's permalink GUID, as a permalink on the production origin", () => {
    const item = only(
      renderRssFeed([
        post({ slug: "building-orbit", contentId: "building-orbit" }),
      ]),
    );
    expect(item.guid).toBe(
      "https://dump.raioviajante.com/posts/building-orbit",
    );
    // Only a permalink while the GUID is the item's link; test origin is not production.
    expect(item.permalink).toBe(String(item.guid === item.link));
  });

  it("keeps the GUID and drops isPermaLink when a legacy slug changes", () => {
    const item = only(
      renderRssFeed([
        post({ slug: "orbit-renamed", contentId: "building-orbit" }),
      ]),
    );
    expect(item.guid).toBe(
      "https://dump.raioviajante.com/posts/building-orbit",
    );
    expect(item.link).toMatch(/\/posts\/orbit-renamed$/);
    expect(item.permalink).toBe("false");
  });

  it("gives a new English post a non-permalink tag GUID", () => {
    const item = only(
      renderRssFeed([post({ slug: "brand-new", contentId: "brand-new" })]),
    );
    expect(item.guid).toBe("tag:dump.raioviajante.com,2026:post/brand-new/en");
    expect(item.permalink).toBe("false");
  });

  it("derives Portuguese GUIDs only from (contentId, locale)", () => {
    expect(rssGuid({ contentId: "building-orbit", locale: "pt-BR" })).toBe(
      "tag:dump.raioviajante.com,2026:post/building-orbit/pt-BR",
    );
  });

  it("is independent of slug, title, date and order", () => {
    const a = post({ contentId: "work", locale: "pt-BR", slug: "um" });
    const b = post({
      contentId: "work",
      locale: "pt-BR",
      slug: "outro",
      title: "Outro",
      publishedAt: "2030-02-02",
    });
    expect(rssGuid(a)).toBe(rssGuid(b));
    expect(rssGuid(a)).toBe(tagGuid("work", "pt-BR"));
  });

  it("gives a translation a distinct identity from its original, even for legacy works", () => {
    for (const contentId of LEGACY_ENGLISH_CONTENT_IDS) {
      expect(rssGuid({ contentId, locale: "pt-BR" })).not.toBe(
        rssGuid({ contentId, locale: "en" }),
      );
    }
    expect(tagGuid("x", "en")).not.toBe(tagGuid("x", "pt-BR"));
  });

  it("never reuses a GUID across the real published inventory", () => {
    const published = [
      ...getPublishedPosts("en"),
      ...getPublishedPosts("pt-BR"),
    ];
    const guids = published.map(rssGuid);
    expect(new Set(guids).size).toBe(guids.length);
  });

  it("treats every pre-migration English post as legacy and nothing else", () => {
    const english = getPublishedPosts("en");
    const legacy = english.filter((p) => !rssGuid(p).startsWith("tag:"));
    expect(legacy.map((p) => p.contentId).sort()).toEqual(
      [...LEGACY_ENGLISH_CONTENT_IDS].sort(),
    );
  });
});

describe("locale-specific feeds", () => {
  const en = englishFeed();
  const pt = portugueseFeed();
  let enText = "";
  let ptText = "";
  beforeAll(async () => {
    enText = await en.clone().text();
    ptText = await pt.clone().text();
  });

  it("serves both as RSS", () => {
    for (const response of [en, pt])
      expect(response.headers.get("Content-Type")).toBe(
        "application/rss+xml; charset=utf-8",
      );
  });

  it("keeps English at /rss.xml with language en and its own self link", async () => {
    const feed = enText;
    expect(feed).toContain("<language>en</language>");
    expect(feed).toContain(
      `<atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />`,
    );
    expect(feed).toContain(`<description>${site.description}</description>`);
  });

  it("serves Portuguese at /pt/rss.xml with language pt-BR, Portuguese text and its own self link", async () => {
    const feed = ptText;
    expect(feed).toContain("<language>pt-BR</language>");
    expect(feed).toContain(
      `<atom:link href="${site.url}/pt/rss.xml" rel="self" type="application/rss+xml" />`,
    );
    expect(feed).toContain(`<link>${site.url}/pt</link>`);
    expect(feed).toContain("Notas sobre computação");
    expect(feed).not.toContain(site.description);
  });

  it("contains exactly the published posts of its own locale, with localized links and dates", async () => {
    for (const [text, locale, prefix] of [
      [enText, "en", ""],
      [ptText, "pt-BR", "/pt"],
    ] as const) {
      const published = getPublishedPosts(locale);
      const rendered = items(text);
      expect(rendered.map((item) => item.link)).toEqual(
        published.map((p) => `${site.url}${prefix}/posts/${p.slug}`),
      );
      expect(rendered.map((item) => item.pubDate)).toEqual(
        published.map((p) =>
          new Date(`${p.publishedAt}T00:00:00Z`).toUTCString(),
        ),
      );
      expect(rendered.map((item) => item.guid)).toEqual(published.map(rssGuid));
    }
  });

  it("never mixes languages", () => {
    const english = items(enText);
    const portuguese = items(ptText);
    expect(portuguese.length).toBeGreaterThan(0);
    expect(english.some((i) => i.link?.includes("/pt/"))).toBe(false);
    expect(portuguese.every((i) => i.link?.includes("/pt/posts/"))).toBe(true);
    expect(portuguese.every((i) => i.guid?.endsWith("/pt-BR"))).toBe(true);
    const guids = new Set(english.map((i) => i.guid));
    expect(portuguese.some((i) => guids.has(i.guid))).toBe(false);
    expect(() => renderRssFeed([post({ locale: "pt-BR" })], "en")).toThrow(
      /pt-BR/,
    );
    expect(() => renderRssFeed([post()], "pt-BR")).toThrow(/en/);
  });

  it("keeps a Portuguese-original and a translated work as distinct items", () => {
    const feed = renderRssFeed(
      [
        post({
          slug: "talvez",
          contentId: "maybe-this-can-be-something-someday",
          locale: "pt-BR",
          originalLocale: "en",
        }),
        post({
          slug: "original-pt",
          contentId: "original-pt",
          locale: "pt-BR",
          originalLocale: "pt-BR",
        }),
      ],
      "pt-BR",
    );
    const translated = items(feed)[0]!;
    const original = items(feed)[1]!;
    expect(translated.guid).toBe(
      "tag:dump.raioviajante.com,2026:post/maybe-this-can-be-something-someday/pt-BR",
    );
    expect(original.guid).toBe(
      "tag:dump.raioviajante.com,2026:post/original-pt/pt-BR",
    );
    expect(translated.link).toMatch(/\/pt\/posts\/talvez$/);
  });
});

describe("feed categories", () => {
  const categories = (feed: string) =>
    [...feed.matchAll(/<category>([^<]*)<\/category>/g)].map((m) => m[1]);

  it("shows Portuguese readers the Portuguese tag labels, not the tag ids", () => {
    const tags = ["personal", "architecture", "meta"];
    const labels = tags.map((id) => tagPresentation(id, "pt-BR").label);
    const feed = renderRssFeed(
      [post({ locale: "pt-BR", originalLocale: "pt-BR", tags })],
      "pt-BR",
    );
    expect(categories(feed)).toEqual(labels);
    expect(labels).not.toEqual(tags);
  });

  it("keeps every published Portuguese category equal to its presentation label", () => {
    for (const published of getPublishedPosts("pt-BR"))
      for (const label of categories(renderRssFeed([published], "pt-BR")))
        expect(
          published.tags.map((id) => tagPresentation(id, "pt-BR").label),
        ).toContain(label);
  });

  it("keeps English categories as the stable tag ids", () => {
    const feed = renderRssFeed([post({ tags: ["osdev"] })]);
    expect(categories(feed)).toEqual(["osdev"]);
  });

  it("escapes category labels", () => {
    const feed = renderRssFeed([post({ tags: ["osdev"] })]);
    expect(feed).not.toMatch(/<category>[^<]*[&"'][^<]*<\/category>/);
  });
});

describe("publication filter", () => {
  it("leaves drafts and unpublished locales out of both feeds", () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "rss-"));
    const write = (slug: string, locale: string, draft: boolean) =>
      fs.writeFileSync(
        path.join(directory, `${slug}.mdx`),
        `---\ncontentId: work\nlocale: ${locale}\noriginalLocale: en\ntitle: T ${slug}\ndescription: D\npublishedAt: '2026-02-02'\ntags: []\ndraft: ${draft}\n---\nbody\n`,
      );
    write("work", "en", false);
    write("trabalho", "pt-BR", true);
    try {
      const en = items(renderRssFeed(getPublishedPosts("en", directory)));
      const pt = items(
        renderRssFeed(getPublishedPosts("pt-BR", directory), "pt-BR"),
      );
      expect(en).toHaveLength(1);
      expect(pt).toHaveLength(0);
    } finally {
      fs.rmSync(directory, { recursive: true });
    }
  });
});

describe("feed autodiscovery", () => {
  const advertised = (locale: "en" | "pt-BR") =>
    alternatesFor("/x", undefined, locale).types["application/rss+xml"];

  it("points each locale's pages at that locale's feed only", () => {
    expect(advertised("en").map((l) => l.url)).toEqual(["/rss.xml"]);
    expect(advertised("pt-BR").map((l) => l.url)).toEqual(["/pt/rss.xml"]);
  });

  it("derives the path from the locale registry", () => {
    expect(rssPath("en")).toBe("/rss.xml");
    expect(rssPath("pt-BR")).toBe("/pt/rss.xml");
  });
});
