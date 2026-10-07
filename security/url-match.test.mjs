import assert from "node:assert/strict";
import test from "node:test";
import { cspListsHost, includesOrigin, originOf } from "./url-match.mjs";

test("an origin matches only itself, however the URL is written", () => {
  assert.equal(
    originOf("https://giscus.app/client.js?x=1"),
    "https://giscus.app",
  );
  assert.equal(originOf("not a url"), undefined);
  assert.ok(
    includesOrigin(["https://giscus.app/en/widget"], "https://giscus.app"),
  );
  assert.ok(
    includesOrigin(new Set(["https://giscus.app"]), "https://giscus.app"),
  );
});

test("lookalike hosts and query-string occurrences are not the origin", () => {
  for (const url of [
    "https://giscus.app.example.com/",
    "https://evilgiscus.app/",
    "https://evil.test/?next=https://giscus.app/",
    "https://evil.test/#https://giscus.app",
    "https://giscus.app@evil.test/",
    "http://giscus.app/",
    "https://giscus.app:8443/",
  ]) {
    assert.ok(!includesOrigin([url], "https://giscus.app"), url);
  }
  assert.ok(!includesOrigin([], "https://giscus.app"));
  assert.ok(!includesOrigin(["https://giscus.app"], "giscus.app"));
});

test("a CSP lists a host exactly, by subdomain or by wildcard, never by lookalike", () => {
  for (const csp of [
    "img-src 'self' https://githubassets.com",
    "img-src https://avatars.githubassets.com/x",
    "img-src https://*.githubassets.com",
    "default-src 'none'; frame-src https://githubassets.com; img-src 'self'",
  ]) {
    assert.ok(cspListsHost(csp, "githubassets.com"), csp);
  }
  for (const csp of [
    "default-src 'none'; img-src 'self' data:",
    "img-src https://githubassets.com.evil.test",
    "img-src https://notgithubassets.com",
    "img-src https://evil.test/?next=https://githubassets.com/",
    "img-src 'self'; connect-src https://evil.test/githubassets.com",
  ]) {
    assert.ok(!cspListsHost(csp, "githubassets.com"), csp);
  }
});
