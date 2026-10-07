import assert from "node:assert/strict";
import test from "node:test";
import { contentSecurityPolicy } from "./headers.ts";
import { siteOrigins } from "../site/sites.ts";
import { cspListsHost } from "./url-match.mjs";
import {
  classify,
  createFrameTracker,
  frameHosts,
  frameInternalOrigins,
  judge,
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
      site === "dump" ? 1 : 0,
    );
  }
  assert.deepEqual(
    thirdPartyAllowances("dump", "comments").map((item) => item.origin),
    ["https://giscus.app"],
  );
});

test("the allowlist agrees with the CSP in both directions", () => {
  for (const site of sites) {
    const csp = contentSecurityPolicy(site, "abcdefghijklmnopqrstuv==");
    for (const origin of siblingOrigins(site))
      assert.ok(csp.includes(origin), `${site}: sibling ${origin} not in CSP`);
    // Page-level origins and frame hosts must be allowed by our CSP...
    for (const item of thirdParties[site]?.comments ?? [])
      assert.ok(csp.includes(item.origin), item.origin);
    for (const host of frameHosts[site] ?? [])
      assert.match(csp, new RegExp(`frame-src ${host}`), host);
    // ...and what a frame loads is the frame owner's business: never listed.
    assert.ok(!cspListsHost(csp, "githubassets.com"));
    assert.ok(!cspListsHost(csp, "githubusercontent.com"));
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

test("parent-page origins hard fail; frame hosts are enforced; frame internals are reported", () => {
  const ob = (url, extra = {}) => ({
    app: "dump",
    page: "/posts/x",
    url,
    ...extra,
  });
  const own = ["http://dump.localhost:3001"];
  const judged = (observation, state = "comments") =>
    judge(observation, state, own);
  // The document itself.
  assert.equal(judged(ob("https://giscus.app/client.js")).verdict, "ok");
  assert.equal(judged(ob("https://tracker.example/p.gif")).verdict, "fail");
  assert.equal(
    judged(ob("https://giscus.app/client.js"), "page").verdict,
    "fail",
  );
  // Inside an approved frame: whatever it loads is reported, not enforced.
  const inFrame = (url) =>
    ob(url, { frame: true, frameHost: "https://giscus.app" });
  for (const url of [
    "https://github.githubassets.com/images/mona-loading-default.gif",
    "https://avatars.githubusercontent.com/u/1?v=4",
    "https://some-new-cdn.example/x.js",
  ])
    assert.deepEqual(judged(inFrame(url)).verdict, "report", url);
  assert.equal(
    judged(inFrame("http://dump.localhost:3001/giscus.css")).verdict,
    "ok",
  );
  // The frame's own host and internal URLs are not "frame-internal" findings.
  assert.equal(judged(inFrame("https://giscus.app/en/widget")).verdict, "ok");
  assert.equal(judged(inFrame("data:image/png;base64,AA")).verdict, "ok");
  assert.equal(
    judged(ob("data:image/png;base64,AA", { frame: true })).verdict,
    "ok",
  );
  assert.equal(
    judged(inFrame("https://docs.raioviajante.com/search-index.json")).verdict,
    "ok",
  );
  // A frame served from anywhere else fails, whatever it loads.
  const wrongHost = ob("https://giscus.app/x", {
    frame: true,
    frameHost: "https://evil.example",
  });
  assert.match(
    judged(wrongHost).message,
    /unexpected frame host https:\/\/evil\.example/,
  );
  assert.match(
    judged(ob("https://giscus.app/x", { frame: true })).message,
    /unexpected frame host \(unknown\)/,
  );
  // Reporting lists the frame-internal origins with counts.
  const seen = frameInternalOrigins(
    [
      inFrame("https://github.githubassets.com/a.gif"),
      inFrame("https://github.githubassets.com/b.gif"),
      ob("https://giscus.app/client.js"),
    ],
    () => "comments",
    () => own,
  );
  assert.deepEqual([...seen], [["https://github.githubassets.com", 2]]);
});

test("a frame is judged by its current document, not its first", () => {
  const own = ["http://dump.localhost:3001"];
  const TOP = "top";
  const GISCUS = "https://giscus.app/en/widget?origin=x";
  // Replays BiDi request events through the tracker and returns each verdict.
  const replay = (events) => {
    const track = createFrameTracker(TOP);
    return events.map(([context, url, navigation = null]) =>
      judge(
        {
          app: "dump",
          page: "/posts/x",
          ...track({ context, url, navigation }),
        },
        "comments",
        own,
      ),
    );
  };
  const verdicts = (events) => replay(events).map((v) => v.verdict);

  // A. approved initial frame document
  assert.deepEqual(verdicts([["f1", GISCUS, "n1"]]), ["ok"]);
  // B. its ordinary subresources are reported, not failed
  assert.deepEqual(
    verdicts([
      ["f1", GISCUS, "n1"],
      ["f1", "https://github.githubassets.com/a.gif"],
      ["f1", "https://avatars.githubusercontent.com/u/1"],
    ]),
    ["ok", "report", "report"],
  );
  // C. a later document navigation to an unapproved origin hard fails
  const moved = replay([
    ["f1", GISCUS, "n1"],
    ["f1", "https://unexpected.example/frame", "n2"],
    ["f1", "https://unexpected.example/x.js"],
  ]);
  assert.deepEqual(
    moved.map((v) => v.verdict),
    ["ok", "fail", "fail"],
  );
  assert.match(
    moved[1].message,
    /unexpected frame host https:\/\/unexpected\.example/,
  );
  // ...including through a redirect hop (same navigation id, redirectCount 1)
  assert.deepEqual(
    verdicts([
      ["f1", GISCUS, "n1"],
      ["f1", "https://giscus.app/redirect", "n2"],
      ["f1", "https://unexpected.example/landing", "n2"],
    ]),
    ["ok", "ok", "fail"],
  );
  // D. a same-origin navigation is allowed, and subresources stay reported
  assert.deepEqual(
    verdicts([
      ["f1", GISCUS, "n1"],
      ["f1", "https://giscus.app/en/widget?page=2", "n2"],
      ["f1", "https://github.githubassets.com/b.gif"],
    ]),
    ["ok", "ok", "report"],
  );
  // E. an unapproved initial frame document hard fails
  assert.deepEqual(verdicts([["f1", "https://unexpected.example/", "n1"]]), [
    "fail",
  ]);
  // Frames are independent, and a navigation back to an approved origin is fine.
  assert.deepEqual(
    verdicts([
      ["f1", GISCUS, "n1"],
      ["f2", "https://unexpected.example/", "n2"],
      ["f1", "https://github.githubassets.com/c.gif"],
    ]),
    ["ok", "fail", "report"],
  );
  // The top document is never a frame.
  assert.equal(
    replay([[TOP, "http://dump.localhost:3001/", "n0"]])[0].verdict,
    "ok",
  );
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
