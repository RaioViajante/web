/** @jest-environment node */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import fixture from "./fixtures/legacy-rss-identity.json";

// The English feed's public identity as production served it before the
// localized-RSS migration (issue #48), captured from the live /rss.xml.
// Feed readers key items by GUID, so every recorded item must keep its GUID,
// link, pubDate and isPermaLink for as long as its post is published. An
// editorial removal must edit the fixture on purpose, in the same change: the
// raw capture stays untouched, and the removed GUIDs are listed in
// `retiredGuids` so they are expected to be absent instead.
const PRODUCTION_ORIGIN = "https://dump.raioviajante.com";

const retired = new Set(fixture.retiredGuids);
const live = fixture.items.filter((item) => !retired.has(item.guid));

interface FeedItem {
  guid: string;
  isPermaLink: string | undefined;
  link: string | undefined;
  pubDate: string | undefined;
}

function parseItems(xml: string): FeedItem[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(
    ([, body = ""]) => ({
      guid: body.match(/<guid[^>]*>([^<]*)<\/guid>/)![1]!,
      isPermaLink: body.match(/<guid isPermaLink="([^"]+)"/)?.[1],
      link: body.match(/<link>([^<]*)<\/link>/)?.[1],
      pubDate: body.match(/<pubDate>([^<]*)<\/pubDate>/)?.[1],
    }),
  );
}

let feed = "";

beforeAll(async () => {
  process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_ORIGIN;
  jest.resetModules();
  const { GET } = await import("@/app/rss.xml/route");
  feed = await GET().text();
});

describe("recorded production snapshot", () => {
  it("is the untouched raw capture", () => {
    const raw = fs.readFileSync(
      path.join(__dirname, "fixtures", fixture.rawFile),
      "utf8",
    );
    expect(createHash("sha256").update(raw).digest("hex")).toBe(
      fixture.rawSha256,
    );
    expect(parseItems(raw)).toEqual(fixture.items);
  });

  it("covers a permalink GUID per item", () => {
    expect(fixture.items.length).toBeGreaterThan(0);
    for (const item of fixture.items) {
      expect(item.guid).toBe(item.link);
      expect(item.isPermaLink).toBe("true");
    }
  });
});

describe("English /rss.xml against the production snapshot", () => {
  const rendered = () => parseItems(feed);

  it("serves every recorded item with identical GUID, isPermaLink, link and pubDate", () => {
    const byGuid = new Map(rendered().map((item) => [item.guid, item]));
    for (const recorded of live) {
      expect(byGuid.get(recorded.guid)).toEqual(recorded);
    }
  });

  it("no longer serves a retired item, under its permalink GUID or any other", () => {
    expect(retired.size).toBe(4);
    for (const item of fixture.items.filter((i) => retired.has(i.guid))) {
      expect(feed).not.toContain(item.guid);
      expect(feed).not.toContain(item.link);
    }
  });

  it("lists no GUID or link twice", () => {
    const rows = rendered();
    expect(new Set(rows.map((i) => i.guid)).size).toBe(rows.length);
    expect(new Set(rows.map((i) => i.link)).size).toBe(rows.length);
  });

  it("never reuses a legacy GUID for any other item", () => {
    const legacy = new Set(fixture.items.map((i) => i.guid));
    const recordedLinks = new Map(fixture.items.map((i) => [i.guid, i.link]));
    for (const item of rendered())
      if (legacy.has(item.guid))
        expect(item.link).toBe(recordedLinks.get(item.guid));
      else
        expect(item.guid).toMatch(/^tag:dump\.raioviajante\.com,2026:post\//);
  });

  it("accepts a new English post without touching the snapshot", async () => {
    const { renderRssFeed } = await import("@/lib/rss");
    const { getPublishedPosts } = await import("@/lib/posts");
    const added = {
      ...getPublishedPosts("en")[0]!,
      slug: "brand-new",
      contentId: "brand-new",
      publishedAt: "2026-12-01",
    };
    const extended = parseItems(
      renderRssFeed([added, ...getPublishedPosts("en")]),
    );
    const published = getPublishedPosts("en").length;
    expect(extended).toHaveLength(published + 1);
    expect(published).toBeGreaterThanOrEqual(live.length);
    expect(extended[0]).toMatchObject({
      guid: "tag:dump.raioviajante.com,2026:post/brand-new/en",
      isPermaLink: "false",
    });
    for (const recorded of live) expect(extended).toContainEqual(recorded);
  });

  it("gives the English translation of a Portuguese original the non-legacy tag GUID", () => {
    const added = rendered().filter(
      (item) => !live.some((recorded) => recorded.guid === item.guid),
    );
    expect(added).toEqual([
      {
        guid: "tag:dump.raioviajante.com,2026:post/for-those-who-never-quite-belonged/en",
        isPermaLink: "false",
        link: `${PRODUCTION_ORIGIN}/posts/for-those-who-never-quite-belonged`,
        pubDate: "Fri, 30 Oct 2026 00:00:00 GMT",
      },
      {
        guid: "tag:dump.raioviajante.com,2026:post/algumas-coisas-nao-sabem-como-terminar/en",
        isPermaLink: "false",
        link: `${PRODUCTION_ORIGIN}/posts/some-things-dont-know-how-to-end`,
        pubDate: "Fri, 30 Oct 2026 00:00:00 GMT",
      },
      {
        guid: "tag:dump.raioviajante.com,2026:post/traduzir-o-site-sem-fingir-que-tudo-ja-existe/en",
        isPermaLink: "false",
        link: `${PRODUCTION_ORIGIN}/posts/translating-the-site-without-pretending-everything-already-exists`,
        pubDate: "Mon, 19 Oct 2026 00:00:00 GMT",
      },
    ]);
  });

  it("keeps the recorded channel contract", () => {
    const channel = feed.slice(0, feed.indexOf("<item>"));
    const field = (re: RegExp) => channel.match(re)?.[1];
    expect({
      title: field(/<title>([^<]*)<\/title>/),
      link: field(/<link>([^<]*)<\/link>/),
      description: field(/<description>([^<]*)<\/description>/),
      language: field(/<language>([^<]*)<\/language>/),
      self: field(/<atom:link href="([^"]+)" rel="self"/),
    }).toEqual(fixture.channel);
  });
});
