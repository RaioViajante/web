import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

// Node's native TypeScript support does not resolve Next's extensionless imports.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.endsWith("/site/locales") ||
      specifier.endsWith("/site/sites")
    )
      return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});

const { localeParticipation } = await import("../../../site/locales.ts");
const {
  feedSourceOrigin,
  feedUrl,
  getLatestWriting,
  getRecentPosts,
  parseRecentPosts,
} = await import("../lib/writing.ts");

const ptPost = "https://dump.raioviajante.com/pt/posts/um-texto";
const enPost = "https://dump.raioviajante.com/posts/an-english-post";
const feed = (items) =>
  `<rss><channel><language>pt-BR</language>${items
    .map(
      ([title, link]) =>
        `<item><title>${title}</title><link>${link}</link><pubDate>Mon, 19 Oct 2026 00:00:00 GMT</pubDate></item>`,
    )
    .join("")}</channel></rss>`;

test("Root reads only the active Portuguese Dump feed and never substitutes English entries", async (t) => {
  const previousFetch = globalThis.fetch;
  const previousParticipation = localeParticipation.dump["pt-BR"];
  t.after(() => {
    globalThis.fetch = previousFetch;
    localeParticipation.dump["pt-BR"] = previousParticipation;
  });

  assert.equal(feedUrl("en"), "https://dump.raioviajante.com/rss.xml");
  assert.equal(feedUrl("pt-BR"), "https://dump.raioviajante.com/pt/rss.xml");
  assert.deepEqual(parseRecentPosts(feed([["English", enPost]]), "pt-BR"), []);

  const requests = [];
  globalThis.fetch = async (url) => {
    requests.push(url);
    return {
      ok: true,
      text: async () =>
        feed([
          ["Um texto", ptPost],
          ["English", enPost],
        ]),
    };
  };
  assert.deepEqual(await getLatestWriting("pt-BR"), {
    state: "ready",
    posts: [{ title: "Um texto", url: ptPost, date: "2026-10-19" }],
  });
  assert.deepEqual(requests, [feedUrl("pt-BR")]);

  globalThis.fetch = async () => ({
    ok: true,
    text: async () => feed([["English", enPost]]),
  });
  assert.deepEqual(await getLatestWriting("pt-BR"), { state: "unavailable" });
  globalThis.fetch = async () => {
    throw new Error("offline");
  };
  assert.deepEqual(await getLatestWriting("pt-BR"), { state: "unavailable" });

  // Rollback removes advertising/consumption before the published feed is withdrawn.
  localeParticipation.dump["pt-BR"] = false;
  globalThis.fetch = async () => {
    throw new Error("inactive feed was fetched");
  };
  assert.deepEqual(await getLatestWriting("pt-BR"), { state: "unavailable" });
});

test("the feed source is production unless a loopback origin is configured", () => {
  const production = "https://dump.raioviajante.com";
  assert.equal(feedSourceOrigin(undefined), production);
  assert.equal(feedSourceOrigin(""), production);
  assert.equal(
    feedSourceOrigin("http://127.0.0.1:3001"),
    "http://127.0.0.1:3001",
  );
  assert.equal(
    feedSourceOrigin("http://localhost:3001"),
    "http://localhost:3001",
  );
  // Anything that is not a loopback http origin is ignored, never followed.
  for (const other of [
    "https://127.0.0.1:3001",
    "http://example.com",
    "http://10.0.0.5:3001",
    "https://dump.raioviajante.com",
    "not a url",
  ])
    assert.equal(feedSourceOrigin(other), production, other);
  // The public feed URL is never rewritten.
  assert.equal(feedUrl("en"), `${production}/rss.xml`);
});

test("a configured local Dump, not the deployed feed, decides the latest posts", async (t) => {
  const previousFetch = globalThis.fetch;
  const previousEnv = process.env.DUMP_FEED_ORIGIN;
  t.after(() => {
    globalThis.fetch = previousFetch;
    if (previousEnv === undefined) delete process.env.DUMP_FEED_ORIGIN;
    else process.env.DUMP_FEED_ORIGIN = previousEnv;
  });
  const stale = "https://dump.raioviajante.com/posts/retired-in-this-commit";
  const current = "https://dump.raioviajante.com/posts/kept-in-this-commit";
  const served = {
    "https://dump.raioviajante.com/rss.xml": feed([["Stale", stale]]),
    "http://127.0.0.1:3001/rss.xml": feed([["Current", current]]),
  };
  const requests = [];
  globalThis.fetch = async (url) => {
    requests.push(url);
    return { ok: true, text: async () => served[url] };
  };

  process.env.DUMP_FEED_ORIGIN = "http://127.0.0.1:3001";
  const local = await getRecentPosts();
  assert.deepEqual(
    local.map((post) => post.url),
    [current],
  );

  delete process.env.DUMP_FEED_ORIGIN;
  const production = await getRecentPosts();
  assert.deepEqual(
    production.map((post) => post.url),
    [stale],
  );
  assert.deepEqual(requests, [
    "http://127.0.0.1:3001/rss.xml",
    "https://dump.raioviajante.com/rss.xml",
  ]);
});
