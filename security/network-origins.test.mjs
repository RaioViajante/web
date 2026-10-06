import assert from "node:assert/strict";
import test from "node:test";
import { contentSecurityPolicy, siteOrigins } from "./headers.ts";
import {
  classify,
  siblingOrigins,
  sites,
  thirdParties,
  thirdPartyAllowances,
  violations,
} from "./network-origins.ts";
import { shippedSources } from "./source-files.mjs";

test("every app is covered and policy derives from siteOrigins", () => {
  assert.deepEqual(sites, Object.keys(siteOrigins));
  for (const site of sites) {
    assert.equal(siblingOrigins(site).length, 3);
    assert.ok(!siblingOrigins(site).includes(siteOrigins[site]));
  }
});

test("only dump has third parties, and only after comments load", () => {
  for (const site of sites) {
    assert.deepEqual(thirdPartyAllowances(site, "page"), []);
    assert.equal(
      thirdPartyAllowances(site, "comments").length,
      site === "dump" ? 2 : 0,
    );
  }
  assert.deepEqual(
    thirdPartyAllowances("dump", "comments").map((item) => item.origin),
    ["https://giscus.app", "https://github.githubassets.com"],
  );
});

test("the allowlist agrees with the CSP in both directions", () => {
  for (const site of sites) {
    const csp = contentSecurityPolicy(site, "abcdefghijklmnopqrstuv==");
    for (const origin of siblingOrigins(site))
      assert.ok(csp.includes(origin), `${site}: sibling ${origin} not in CSP`);
    for (const item of thirdParties[site]?.comments ?? [])
      // Page-level origins must be allowed by the CSP; frame-level ones are
      // governed by the frame's own policy and must not widen ours.
      assert.equal(csp.includes(item.origin), item.via === "page", item.origin);
    assert.ok(
      (thirdParties[site]?.comments ?? []).every(
        (item) => item.reason.length > 20,
      ),
    );
  }
});

test("classification", () => {
  const dump = (url, state, own) => classify(url, "dump", state, own).kind;
  assert.equal(dump("https://dump.raioviajante.com/x"), "own");
  assert.equal(
    dump("http://dump.localhost:3001/", "page", ["http://dump.localhost:3001"]),
    "own",
  );
  assert.equal(dump("http://dump.localhost:3001/"), "unexpected");
  assert.equal(
    dump("https://docs.raioviajante.com/search-index.json"),
    "sibling",
  );
  assert.equal(dump("wss://lab.raioviajante.com/socket"), "sibling");
  assert.equal(dump("https://giscus.app/client.js", "comments"), "third-party");
  assert.equal(dump("https://giscus.app/client.js"), "unexpected");
  assert.equal(
    classify("https://giscus.app/client.js", "root", "comments").kind,
    "unexpected",
  );
  for (const url of [
    "https://raioviajante.com.evil.example/",
    "https://evilraioviajante.com/",
    "https://giscus.app.evil.example/",
    "http://dump.raioviajante.com/",
    "not a url",
  ])
    assert.equal(dump(url, "comments"), "unexpected", url);
  for (const url of [
    "data:image/png;base64,AA",
    "blob:https://dump.raioviajante.com/x",
    "about:blank",
  ])
    assert.equal(dump(url), "internal", url);
});

test("a violation names app, page, origin and URL", () => {
  const [line, ...rest] = violations(
    [
      { app: "root", page: "/", url: "https://tracker.example/pixel.gif" },
      {
        app: "root",
        page: "/",
        url: "https://dump.raioviajante.com/search-index.json",
      },
    ],
    () => "page",
  );
  assert.equal(rest.length, 0);
  assert.match(
    line,
    /^app root page \/: unexpected origin https:\/\/tracker\.example .*pixel\.gif/,
  );
});

// Static guard: literal absolute URLs handed to network-capable APIs or
// attributes in shipped source. It cannot see URLs assembled at run time and
// does not prove runtime behavior; docs, tests, CSP declarations, hrefs
// (navigation, not loads) and comments are out of scope. The runtime check
// (`pnpm security:origins`) is the real evidence.
const networkLiteral =
  /(?:\bfetch\(|new\s+(?:WebSocket|EventSource)\(|sendBeacon\(|\.src\s*=|\bsrc=|\bsrcSet=|@import\s+(?:url\()?|\burl\()\s*\{?\s*[`"']?(wss?|https?):\/\/([^/"'`)\s]+)/g;

test("shipped source loads no unapproved absolute URL", async () => {
  const approved = new Set(
    [
      ...Object.values(siteOrigins),
      ...Object.values(thirdParties).flatMap((entry) =>
        entry.comments.map((item) => item.origin),
      ),
    ].map((origin) => new URL(origin).host),
  );
  const found = [];
  for await (const [file, text] of shippedSources())
    for (const [, , host] of text.matchAll(networkLiteral))
      found.push(
        `${file}: ${host}${approved.has(host) ? "" : "  <-- not approved"}`,
      );
  assert.deepEqual(
    found.filter((line) => line.includes("not approved")),
    [],
  );
  // Evidence the scan actually reaches the one known case.
  assert.ok(
    found.some((line) => line.endsWith("Comments.tsx: giscus.app")),
    found.join("\n"),
  );
});
