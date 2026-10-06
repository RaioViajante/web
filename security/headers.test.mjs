import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { contentSecurityPolicy, staticHeaders } from "./headers.ts";

for (const site of ["root", "dump", "docs", "lab"]) {
  test(`${site}: restrictive production policy and scoped origins`, () => {
    const csp = contentSecurityPolicy(
      site,
      site === "root" || site === "dump"
        ? "abcdefghijklmnopqrstuv=="
        : undefined,
    );
    assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|https:;|\*/);
    for (const directive of [
      "default-src 'none'",
      "script-src-attr 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ])
      assert.ok(csp.includes(directive), directive);
    assert.equal(csp.includes("giscus.app"), site === "dump");
    assert.doesNotMatch(csp, /api\.github|avatars\.github|github\.com/);
    assert.equal(staticHeaders(site).length, 6);
  });
}

test("reject nonce header injection", () => {
  assert.throws(() => contentSecurityPolicy("root", "bad'; script-src *"));
});

async function* htmlFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = new URL(
      entry.name + (entry.isDirectory() ? "/" : ""),
      directory,
    );
    if (entry.isDirectory()) yield* htmlFiles(file);
    else if (entry.name.endsWith(".html")) yield file;
  }
}

for (const site of ["docs", "lab"]) {
  test(`${site}: every built page works without inline scripts or unlisted styles`, async () => {
    let pages = 0;
    for await (const file of htmlFiles(
      new URL(`../apps/${site}/dist/`, import.meta.url),
    )) {
      const html = await readFile(file, "utf8");
      pages++;
      for (const [, attributes, body] of html.matchAll(
        /<script\b([^>]*)>([\s\S]*?)<\/script>/g,
      )) {
        // A JSON-LD block is data the browser never executes, so the CSP does
        // not govern it; it must still be well-formed JSON.
        if (/\btype="application\/ld\+json"/.test(attributes)) {
          assert.doesNotThrow(() => JSON.parse(body), `${file}: JSON-LD`);
          continue;
        }
        assert.match(
          attributes,
          /\bsrc="\/_astro\/[^" ]+\.js"/,
          `${file}: inline/external script`,
        );
      }
      assert.doesNotMatch(
        html,
        /<style\b|\son\w+=|<astro-island\b|http-equiv="content-security-policy"/i,
        file.href,
      );
      for (const [, value] of html.matchAll(/\sstyle="([^"]*)"/g)) {
        const hash = createHash("sha256").update(value).digest("base64");
        assert.ok(
          contentSecurityPolicy(site).includes(`'sha256-${hash}'`),
          `${file}: unlisted style ${value}`,
        );
      }
    }
    assert.ok(pages > 0, "build the app before running this check");
  });
}
