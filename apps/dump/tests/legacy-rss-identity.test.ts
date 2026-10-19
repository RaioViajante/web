/** @jest-environment node */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import fixture from "./fixtures/legacy-rss-identity.json";

// The English feed's public identity as production served it before the
// localized-RSS migration (issue #48), captured from the live /rss.xml.
// Feed readers key items by GUID, so every recorded item must keep its GUID,
// link, pubDate and isPermaLink for as long as its post is published. An
// editorial removal must edit the fixture on purpose, in the same change.
const PRODUCTION_ORIGIN = "https://dump.raioviajante.com";

interface FeedItem {
  guid: string;
  isPermaLink: string | undefined;
  link: string | undefined;
  pubDate: string | undefined;
}

function parseItems(xml: string): FeedItem[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, body]) => ({
    guid: body.match(/<guid[^>]*>([^<]*)<\/guid>/)![1],
    isPermaLink: body.match(/<guid isPermaLink="([^"]+)"/)?.[1],
    link: body.match(/<link>([^<]*)<\/link>/)?.[1],
    pubDate: body.match(/<pubDate>([^<]*)<\/pubDate>/)?.[1],
  }));
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
    for (const recorded of fixture.items) {
      expect(byGuid.get(recorded.guid)).toEqual(recorded);
    }
  });

  it("has no unrecorded or duplicated items while the editorial set is unchanged", () => {
    const guids = rendered().map((item) => item.guid);
    expect(new Set(guids).size).toBe(guids.length);
    expect(guids).toEqual(fixture.items.map((item) => item.guid));
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
