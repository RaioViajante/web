import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checkUniqueness } from "./metadata-policy.ts";
import { auditSite, expectedThemeColor } from "./audit.mjs";

// Deterministic, no sockets: the build output of each app. Docs and Lab are
// static, so every sitemap page is checked in full. Root and Dump render their
// documents per request (nonce CSP), so only their static files (sitemap,
// robots, manifest, RSS) are read here; their documents are checked over HTTP
// by `pnpm seo:verify`. Run after `pnpm -r build` with
// NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com.
const app = (site) => new URL(`../apps/${site}/`, import.meta.url);
const read = (site, path) => {
  const file = new URL(path, app(site));
  assert.ok(
    existsSync(file),
    `app ${site}: ${path} not found; build the app first`,
  );
  return readFile(file, "utf8");
};

const filesOf = {
  root: async () => ({
    sitemap: await read("root", ".next/server/app/sitemap.xml.body"),
    robots: await read("root", ".next/server/app/robots.txt.body"),
    manifest: await read("root", ".next/server/app/manifest.webmanifest.body"),
  }),
  dump: async () => ({
    sitemap: await read("dump", ".next/server/app/sitemap.xml.body"),
    robots: await read("dump", ".next/server/app/robots.txt.body"),
    manifest: await read("dump", ".next/server/app/manifest.webmanifest.body"),
    rss: await read("dump", ".next/server/app/rss.xml.body"),
  }),
  docs: async () => ({
    sitemap: await read("docs", "dist/sitemap.xml"),
    robots: await read("docs", "dist/robots.txt"),
    manifest: await read("docs", "dist/manifest.webmanifest"),
  }),
  lab: async () => ({
    sitemap: await read("lab", "dist/sitemap.xml"),
    robots: await read("lab", "dist/robots.txt"),
    manifest: await read("lab", "dist/manifest.webmanifest"),
  }),
};
const staticHtml = (site) => async (path) => {
  const file = path.endsWith("/") ? `${path}index.html` : `${path}.html`;
  return existsSync(new URL(`dist${file}`, app(site)))
    ? read(site, `dist${file}`)
    : undefined;
};

const pages = [];
for (const site of ["root", "dump", "docs", "lab"])
  test(`${site}: build output satisfies the SEO contract`, async () => {
    const result = await auditSite({
      site,
      files: await filesOf[site](),
      html: site === "docs" || site === "lab" ? staticHtml(site) : undefined,
      themeColor: await expectedThemeColor(),
    });
    pages.push(...result.pages);
    assert.deepEqual(result.problems, []);
    assert.ok(result.entries.length > 0);
  });

test("titles and descriptions are unique across the static documents", () => {
  assert.ok(pages.length >= 15, "docs and lab documents were checked");
  assert.deepEqual(checkUniqueness(pages), []);
});
