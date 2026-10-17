import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isReservedPath } from "../site/locales.ts";
import { siteOrigins } from "../site/sites.ts";
import { checkBaselineSearchIndex } from "./english-baseline.ts";
import { checkEnglishIndexLocale, checkIndexLocale } from "./search-index.ts";

const baseline = JSON.parse(
  await readFile(new URL("./english-baseline.json", import.meta.url), "utf8"),
);

const entry = (extra = {}) => ({
  site: "docs",
  locale: "en",
  title: "T",
  href: "https://docs.raioviajante.com/x/",
  description: "D",
  ...extra,
});
const check = (entries) =>
  checkEnglishIndexLocale("docs", "/search-index.json", entries);

test("an English index whose every entry says locale en passes", () => {
  assert.deepEqual(check([entry(), entry({ body: "b" })]), []);
});

test("every entry is checked, not a representative one", () => {
  assert.match(
    check([entry(), entry({ locale: undefined })]).join(),
    /1 entries have locale missing/,
  );
  assert.match(
    check([entry(), entry({ locale: "pt-BR" })]).join(),
    /locale "pt-BR", expected "en"/,
  );
  assert.match(
    check([
      entry({ locale: "en-US" }),
      entry({ locale: "en_US" }),
      entry({ locale: "English" }),
    ]).join(),
    /3 entries|1 entries/,
  );
  assert.match(check([entry({ locale: null })]).join(), /locale null/);
});

test("the index must be a non-empty array", () => {
  assert.match(check({}).join(), /not a JSON array/);
  assert.match(check([]).join(), /no entries/);
});

test("the committed #40 baseline is a historical floor: entries with or without locale satisfy it", () => {
  for (const site of Object.keys(baseline)) {
    const recorded = baseline[site].searchIndex;
    const entries = recorded.pages.map((page) =>
      Object.fromEntries([
        ...recorded.fields.map((field) => [field, "x"]),
        ["site", site],
        ["href", `${siteOrigins[site]}${page}`],
      ]),
    );
    assert.deepEqual(
      checkBaselineSearchIndex(site, baseline[site], entries),
      [],
      site,
    );
    const withLocale = entries.map((e) => ({ ...e, locale: "en" }));
    assert.deepEqual(
      checkBaselineSearchIndex(site, baseline[site], withLocale),
      [],
      site,
    );
    assert.ok(
      !recorded.fields.includes("locale"),
      "locale is not a baseline field yet",
    );
  }
});

// Docs and Lab publish plain files, so their build output is read here;
// Root and Dump are covered by their route tests and `pnpm seo:verify`, which
// reads all four hosts over HTTP.
for (const site of ["docs", "lab"])
  test(`${site}: every built English index entry carries locale en and keeps its shape`, async () => {
    const file = new URL(
      `../apps/${site}/dist/search-index.json`,
      import.meta.url,
    );
    assert.ok(existsSync(file), `build ${site} first`);
    const entries = JSON.parse(await readFile(file, "utf8"));
    assert.deepEqual(
      checkEnglishIndexLocale(site, "/search-index.json", entries),
      [],
    );
    assert.ok(entries.length > 0);
    for (const entry of entries) {
      assert.equal(entry.locale, "en");
      assert.equal(entry.site, site);
      assert.ok(entry.href.startsWith(`${siteOrigins[site]}/`), entry.href);
      assert.equal(
        isReservedPath(new URL(entry.href).pathname),
        false,
        entry.href,
      );
      for (const field of baseline[site].searchIndex.fields)
        assert.ok(field in entry, `${entry.href} lacks ${field}`);
    }
  });

test("a Portuguese index states pt-BR, the host and Portuguese pages", () => {
  const pt = (extra = {}) => ({
    site: "root",
    locale: "pt-BR",
    title: "início",
    href: "https://raioviajante.com/pt",
    description: "d",
    ...extra,
  });
  const check = (entries) =>
    checkIndexLocale("root", "/pt/search-index.json", entries, "pt-BR");
  assert.deepEqual(
    check([pt(), pt({ href: "https://raioviajante.com/pt/about" })]),
    [],
  );
  assert.match(
    check([pt({ locale: "en" })]).join(),
    /locale "en", expected "pt-BR"/,
  );
  assert.match(check([pt({ locale: undefined })]).join(), /missing/);
  assert.match(check([pt({ site: "docs" })]).join(), /not site "root"/);
  assert.match(
    check([pt({ href: "https://raioviajante.com/about" })]).join(),
    /do not link to a pt-BR page/,
  );
  assert.match(
    check([pt({ href: "https://docs.raioviajante.com/pt/" })]).join(),
    /do not link to a pt-BR page/,
  );
  assert.match(check([]).join(), /no entries/);
  // An English index must not link into the Portuguese tree.
  assert.match(
    checkEnglishIndexLocale("root", "/search-index.json", [
      { site: "root", locale: "en", href: "https://raioviajante.com/pt/about" },
    ]).join(),
    /do not link to a en page/,
  );
});
