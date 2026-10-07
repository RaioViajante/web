import assert from "node:assert/strict";
import test from "node:test";
import { evaluate, judgeBrowserLcp, knownNoLcp } from "./lighthouse-policy.mjs";

const floors = {
  performance: 90,
  accessibility: 100,
  "best-practices": 95,
  seo: 100,
  cls: 0.02,
};
const run = (performance, { lcp = 1500, cls = 0 } = {}) => ({
  scores: { performance, accessibility: 100, "best-practices": 100, seo: 100 },
  metrics: { lcp, cls },
});
const noLcp = () => run(0, { lcp: null });
const known = {
  app: "docs",
  route: "/search/",
  profile: "mobile",
  why: "tool anomaly",
};
const proof = (ok) => async () => ({
  ok,
  reasons: ok ? [] : ["the browser observed no largest-contentful-paint entry"],
});
const quality = { performance: 95 };

test("an unexpected NO_LCP fails and never asks the browser", async () => {
  let asked = false;
  const r = await evaluate([run(99), noLcp(), run(99)], floors, {
    quality,
    browserLcp: async () => ((asked = true), { ok: true, reasons: [] }),
  });
  assert.equal(asked, false);
  assert.match(
    r.problems.join(),
    /NO_LCP\) in 1 of 3 runs; this page\/profile is not a known exception/,
  );
});

test("a page where every run returns NO_LCP fails unless it is the known exception", async () => {
  const r = await evaluate([noLcp(), noLcp(), noLcp()], floors, { quality });
  assert.match(r.problems.join(), /not a known exception/);
  assert.equal(r.valid, 0);
});

test("the known exception passes only with an independent browser LCP, and reports the counts", async () => {
  const ok = await evaluate([noLcp(), run(99), noLcp()], floors, {
    known,
    quality,
    browserLcp: proof(true),
  });
  assert.deepEqual(ok.problems, []);
  assert.equal(ok.valid, 1);
  assert.equal(ok.noLcp, 2);
  assert.equal(ok.performance, 99);
  assert.match(
    ok.notes.join(),
    /2 of 3 Lighthouse runs returned NO_LCP .* independent browser observation found an LCP, 1 runs were valid/,
  );
});

test("the known exception fails when the browser sees no LCP either", async () => {
  const r = await evaluate([noLcp(), run(99), noLcp()], floors, {
    known,
    quality,
    browserLcp: proof(false),
  });
  assert.match(
    r.problems.join(),
    /only accepted while the browser observes a real LCP, and it did not: the browser observed no largest-contentful-paint entry/,
  );
});

test("with every run NO_LCP the known page passes on the browser proof alone and no score is invented", async () => {
  const r = await evaluate([noLcp(), noLcp(), noLcp()], floors, {
    known,
    quality,
    browserLcp: proof(true),
  });
  assert.deepEqual(r.problems, []);
  assert.equal(r.performance, null);
  assert.match(
    r.notes.join(),
    /performance score unavailable: every run returned NO_LCP; no score is reported/,
  );
});

test("a valid score below the hard floor fails", async () => {
  const r = await evaluate([run(85), run(88), run(86)], floors, { quality });
  assert.match(r.problems.join(), /performance 86 is below the floor 90/);
});

test("a valid score from 90 to 94 passes the floor but is reported below the quality target", async () => {
  const r = await evaluate([run(92), run(93), run(91)], floors, { quality });
  assert.deepEqual(r.problems, []);
  assert.match(
    r.notes.join(),
    /performance 92 passes the floor 90 but is below the quality target 95/,
  );
  const high = await evaluate([run(96)], floors, { quality });
  assert.deepEqual(high.notes, []);
});

test("other floors and CLS still fail, whatever happens to LCP", async () => {
  const r = await evaluate(
    [
      {
        ...run(99),
        scores: {
          performance: 99,
          accessibility: 96,
          "best-practices": 100,
          seo: 100,
        },
      },
    ],
    floors,
    { quality },
  );
  assert.match(r.problems.join(), /accessibility 96 is below the floor 100/);
  assert.match(
    (
      await evaluate([run(99, { cls: 0.2 })], floors, { quality })
    ).problems.join(),
    /CLS 0.2 exceeds 0.02/,
  );
});

test("the exception is scoped to docs /search/ on mobile only", () => {
  const list = [known];
  assert.ok(
    knownNoLcp(list, { app: "docs", path: "/search/", profile: "mobile" }),
  );
  assert.equal(
    knownNoLcp(list, { app: "docs", path: "/search/", profile: "desktop" }),
    undefined,
  );
  assert.equal(
    knownNoLcp(list, { app: "lab", path: "/search/", profile: "mobile" }),
    undefined,
  );
  assert.equal(
    knownNoLcp(list, { app: "docs", path: "/", profile: "mobile" }),
    undefined,
  );
});

test("browser proof requires an LCP entry, content, 200 and no errors", () => {
  const good = {
    status: 200,
    entries: [{ time: 180, tag: "IMG" }],
    visibleText: 120,
    pageErrors: [],
    failedRequests: [],
  };
  assert.equal(judgeBrowserLcp(good).ok, true);
  for (const [change, reason] of [
    [{ entries: [] }, /no largest-contentful-paint entry/],
    [{ visibleText: 0 }, /no visible content/],
    [{ status: 404 }, /HTTP 404/],
    [{ pageErrors: ["boom"] }, /page error: boom/],
    [
      { failedRequests: ["404 /x.js"] },
      /failed first-party request: 404 \/x\.js/,
    ],
  ]) {
    const r = judgeBrowserLcp({ ...good, ...change });
    assert.equal(r.ok, false);
    assert.match(r.reasons.join(), reason);
  }
});
