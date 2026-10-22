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
const { feedUrl, getLatestWriting, parseRecentPosts } =
  await import("../lib/writing.ts");

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
