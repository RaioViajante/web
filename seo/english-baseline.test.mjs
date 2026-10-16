import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isReservedPath } from "../site/locales.ts";
import { SITES, siteOrigins } from "../site/sites.ts";
import {
  checkBaselineSearchIndex,
  checkBaselineSitemap,
} from "./english-baseline.ts";
import { checkSitemap } from "./metadata-policy.ts";

const baseline = JSON.parse(
  await readFile(new URL("./english-baseline.json", import.meta.url), "utf8"),
);

test("the baseline covers the four hosts and only English, unprefixed URLs", () => {
  assert.deepEqual(
    Object.keys(baseline).sort(),
    SITES.map((site) => site.id).sort(),
  );
  for (const [site, recorded] of Object.entries(baseline)) {
    assert.ok(recorded.sitemap.includes("/"), `${site} records the home page`);
    for (const path of [
      ...recorded.sitemap,
      ...recorded.endpoints,
      recorded.searchIndex.path,
      ...recorded.searchIndex.pages,
    ])
      assert.equal(
        isReservedPath(path),
        false,
        `${site} ${path} is not English`,
      );
    assert.deepEqual(recorded.sitemap, [...recorded.sitemap].sort(), site);
    assert.ok(recorded.endpoints.includes("/sitemap.xml"), site);
    assert.ok(recorded.endpoints.includes(recorded.searchIndex.path), site);
  }
  assert.ok(baseline.dump.endpoints.includes("/rss.xml"));
  for (const site of ["root", "docs", "lab"])
    assert.equal(baseline[site].endpoints.includes("/rss.xml"), false, site);
});

test("a missing English sitemap page fails, an added one does not", () => {
  const recorded = { ...baseline.docs, sitemap: ["/", "/guide/"] };
  const loc = (path) => `${siteOrigins.docs}${path}`;
  assert.deepEqual(
    checkBaselineSitemap("docs", recorded, [loc("/"), loc("/guide/")]),
    [],
  );
  assert.deepEqual(
    checkBaselineSitemap("docs", recorded, [
      loc("/"),
      loc("/guide/"),
      loc("/pt/"),
    ]),
    [],
  );
  assert.deepEqual(checkBaselineSitemap("docs", recorded, [loc("/")]), [
    "app docs sitemap: English baseline page /guide/ is missing",
  ]);
});

test("the search index keeps its fields and every English page, and may grow", () => {
  const recorded = {
    ...baseline.root,
    searchIndex: {
      path: "/search-index.json",
      fields: ["href", "site", "title"],
      pages: ["/", "/about"],
    },
  };
  const entry = (path, extra = {}) => ({
    site: "root",
    title: path,
    href: `${siteOrigins.root}${path}`,
    ...extra,
  });
  assert.deepEqual(
    checkBaselineSearchIndex("root", recorded, [
      entry("/"),
      entry("/about#team"),
      entry("/pt/about", { locale: "pt-BR" }),
    ]),
    [],
  );
  assert.deepEqual(
    checkBaselineSearchIndex("root", recorded, [
      entry("/"),
      { site: "root", href: "x" },
    ]),
    [
      'app root /search-index.json: 1 entries lack "title"',
      "app root /search-index.json: English baseline page /about is missing",
    ],
  );
  assert.deepEqual(checkBaselineSearchIndex("root", recorded, {}), [
    "app root /search-index.json: not a JSON array",
  ]);
});

// Docs and Lab publish plain files, so their build output is checked here;
// `pnpm seo:verify` applies the same rules to all four hosts over HTTP.
for (const site of ["docs", "lab"])
  test(`${site}: build output keeps the English baseline`, async () => {
    const read = async (path) => {
      const file = new URL(`../apps/${site}/dist${path}`, import.meta.url);
      assert.ok(
        existsSync(file),
        `app ${site}: dist${path} not found; build the app first (pnpm --filter @raioviajante/${site} build)`,
      );
      return readFile(file, "utf8");
    };
    const recorded = baseline[site];
    for (const path of recorded.endpoints)
      assert.ok(
        existsSync(new URL(`../apps/${site}/dist${path}`, import.meta.url)),
        `app ${site}: endpoint ${path} is no longer built`,
      );
    const { entries } = checkSitemap(site, await read("/sitemap.xml"));
    assert.deepEqual(
      checkBaselineSitemap(
        site,
        recorded,
        entries.map((e) => e.loc),
      ),
      [],
    );
    assert.deepEqual(
      checkBaselineSearchIndex(
        site,
        recorded,
        JSON.parse(await read(recorded.searchIndex.path)),
      ),
      [],
    );
  });
