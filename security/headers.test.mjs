import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import {
  contentSecurityPolicy,
  demoHostPaths,
  rootFraming,
  staticHeaders,
  workHeaders,
} from "./headers.ts";
import { isJsonLd, scriptElements, scriptOpenTags } from "./html-scripts.mjs";

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
      for (const { attributes, body } of scriptElements(html)) {
        // A JSON-LD block is data the browser never executes, so the CSP does
        // not govern it; it must still be well-formed JSON.
        if (isJsonLd(attributes)) {
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

const nonce = "abcdefghijklmnopqrstuv==";
const directive = (csp, name) =>
  csp.split("; ").find((item) => item.startsWith(`${name} `));

test("only the Stucco case pages may embed a same-origin frame", () => {
  assert.deepEqual(demoHostPaths, ["/projects/stucco", "/pt/projects/stucco"]);
  for (const path of demoHostPaths) {
    const csp = contentSecurityPolicy("root", nonce, false, rootFraming(path));
    assert.equal(directive(csp, "frame-src"), "frame-src 'self'", path);
    assert.equal(
      directive(csp, "frame-ancestors"),
      "frame-ancestors 'none'",
      path,
    );
  }
  for (const path of [
    "/",
    "/projects",
    "/projects/all",
    "/projects/stucco-2",
    "/projects/stucco/more",
    "/pt/projects",
    "/work/stucco",
  ]) {
    const csp = contentSecurityPolicy("root", nonce, false, rootFraming(path));
    assert.equal(directive(csp, "frame-src"), "frame-src 'none'", path);
    assert.equal(
      directive(csp, "frame-ancestors"),
      "frame-ancestors 'none'",
      path,
    );
  }
});

test("only /work/ may be framed, by the same origin, and it is noindexed", () => {
  const [policy, robots] = workHeaders();
  assert.equal(policy.key, "Content-Security-Policy");
  assert.equal(
    directive(policy.value, "frame-ancestors"),
    "frame-ancestors 'self'",
  );
  assert.equal(directive(policy.value, "frame-src"), "frame-src 'none'");
  assert.doesNotMatch(policy.value, /'nonce-|unsafe-inline|unsafe-eval/);
  assert.equal(directive(policy.value, "script-src"), "script-src 'self'");
  assert.deepEqual(robots, {
    key: "X-Robots-Tag",
    value: "noindex, nofollow",
  });
  const everywhere = staticHeaders("root").find(
    ({ key }) => key === "Content-Security-Policy",
  ).value;
  assert.equal(
    directive(everywhere, "frame-ancestors"),
    "frame-ancestors 'none'",
  );
  assert.equal(directive(everywhere, "frame-src"), "frame-src 'none'");
});

test("only documents with a framing exception omit the https upgrade", () => {
  const upgrade = "upgrade-insecure-requests";
  assert.ok(contentSecurityPolicy("root", nonce).includes(upgrade));
  for (const path of ["/", "/projects", "/projects/all"])
    assert.ok(
      contentSecurityPolicy("root", nonce, false, rootFraming(path)).includes(
        upgrade,
      ),
      path,
    );
  for (const path of demoHostPaths)
    assert.ok(
      !contentSecurityPolicy("root", nonce, false, rootFraming(path)).includes(
        upgrade,
      ),
      path,
    );
  assert.ok(!workHeaders()[0].value.includes(upgrade));
});

test("no other site can opt in to the framing exceptions by default", () => {
  for (const site of ["dump", "docs", "lab"]) {
    const csp = contentSecurityPolicy(site, nonce);
    assert.equal(
      directive(csp, "frame-ancestors"),
      "frame-ancestors 'none'",
      site,
    );
  }
});

test("the Stucco demo works under the site CSP without exceptions", async () => {
  let pages = 0;
  for await (const file of htmlFiles(
    new URL("../apps/root/public/work/stucco/", import.meta.url),
  )) {
    const html = await readFile(file, "utf8");
    pages++;
    for (const attributes of scriptOpenTags(html))
      assert.match(attributes, /\bsrc="assets\/[^" ]+\.js"/, file.href);
    for (const { body } of scriptElements(html))
      assert.equal(body.trim(), "", `${file}: inline script`);
    assert.doesNotMatch(
      html,
      /<style\b|\sstyle=|\son\w+=|http-equiv="content-security-policy"/i,
      file.href,
    );
    assert.match(html, /name="robots"[^>]*noindex/, `${file}: noindex`);
    assert.doesNotMatch(html, /(?:src|href)="https?:/, `${file}: external`);
  }
  assert.equal(pages, 5);
});
