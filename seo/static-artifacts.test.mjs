import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checkUniqueness } from "./metadata-policy.ts";
import { auditSite, expectedThemeColor } from "./audit.mjs";

// Deterministic, no sockets: the public build output of the static apps. Docs
// and Lab publish plain files in `dist/`, so their sitemap, robots.txt,
// manifest and every document (the sitemap pages and the search page) are
// checked in full. Root and Dump render documents per request (nonce CSP) and
// serve their sitemap, robots, manifest and RSS from Next routes whose build
// layout is private to Next, so none of that is read here: `pnpm seo:verify`
// checks all four apps over HTTP, including those. Run after `pnpm -r build`
// with NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com.
const app = (site) => new URL(`../apps/${site}/`, import.meta.url);
const read = (site, path) => {
  const file = new URL(path, app(site));
  assert.ok(
    existsSync(file),
    `app ${site}: ${path} not found; build the app first (pnpm --filter @raioviajante/${site} build)`,
  );
  return readFile(file, "utf8");
};
const html = (site) => async (path) => {
  const file = path.endsWith("/") ? `${path}index.html` : `${path}.html`;
  return existsSync(new URL(`dist${file}`, app(site)))
    ? read(site, `dist${file}`)
    : undefined;
};

const pages = [];
for (const site of ["docs", "lab"])
  test(`${site}: build output satisfies the SEO contract`, async () => {
    const result = await auditSite({
      site,
      files: {
        sitemap: await read(site, "dist/sitemap.xml"),
        robots: await read(site, "dist/robots.txt"),
        manifest: await read(site, "dist/manifest.webmanifest"),
      },
      html: html(site),
      themeColor: await expectedThemeColor(),
    });
    pages.push(...result.pages);
    assert.deepEqual(result.problems, []);
    assert.ok(result.entries.length > 0);
  });

test("titles and descriptions are unique across the static documents", () => {
  for (const site of ["docs", "lab"])
    assert.ok(
      pages.some((p) => p.site === site),
      `${site} documents were checked`,
    );
  assert.deepEqual(checkUniqueness(pages), []);
});
