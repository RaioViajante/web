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
  checkEnglishIndexLocale(
    "docs",
    "/search-index.json",
    entries,
    ["/x/"],
    ["/x/"],
  );

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

test("the index must be an array and cannot be empty when searchable pages exist", () => {
  assert.match(check({}).join(), /not a JSON array/);
  assert.match(check([]).join(), /empty index despite 1 published searchable/);
  assert.deepEqual(
    checkEnglishIndexLocale("docs", "/search-index.json", [], ["/"], []),
    [],
  );
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
    const sitemap = await readFile(
      new URL(`../apps/${site}/dist/sitemap.xml`, import.meta.url),
      "utf8",
    );
    const publishedPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      ([, loc]) => new URL(loc).pathname,
    );
    assert.deepEqual(
      checkEnglishIndexLocale(
        site,
        "/search-index.json",
        entries,
        publishedPaths,
        baseline[site].searchIndex.pages,
      ),
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
    checkIndexLocale(
      "root",
      "/pt/search-index.json",
      entries,
      "pt-BR",
      ["/pt", "/pt/about"],
      ["/pt", "/pt/about"],
    );
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
  assert.match(check([]).join(), /empty index despite 2 published searchable/);
  // An English index must not link into the Portuguese tree.
  assert.match(
    checkEnglishIndexLocale(
      "root",
      "/search-index.json",
      [
        {
          site: "root",
          locale: "en",
          title: "about",
          href: "https://raioviajante.com/pt/about",
          description: "d",
        },
      ],
      ["/about"],
      ["/about"],
    ).join(),
    /do not link to a en page/,
  );
});

test("required and optional entry fields have their declared types", () => {
  assert.match(check([entry({ title: undefined })]).join(), /field "title"/);
  assert.match(check([entry({ href: 42 })]).join(), /field "href"/);
  assert.match(check([entry({ body: false })]).join(), /field "body"/);
  assert.match(check([entry({ title: "" })]).join(), /field "title" is empty/);
  assert.match(
    check([entry({ description: " " })]).join(),
    /field "description" is empty/,
  );
  assert.match(check([null]).join(), /entry 1 is not an object/);
});

test("destinations must belong to the authoritative published inventory", () => {
  assert.match(
    check([entry({ href: "https://docs.raioviajante.com/ghost/" })]).join(),
    /absent from the published sitemap inventory/,
  );
});

test("exact duplicate entries are rejected while same-page section entries remain supported", () => {
  const samePage = entry();
  assert.match(
    check([samePage, { ...samePage }]).join(),
    /1 duplicate entries/,
  );
  assert.deepEqual(
    check([
      samePage,
      entry({ title: "Section", href: `${samePage.href}#section` }),
    ]),
    [],
  );
});

test("Dump content entries require stable unique content ids", () => {
  const dump = (extra = {}) => ({
    site: "dump",
    locale: "pt-BR",
    contentId: "uma-obra",
    title: "Uma obra",
    href: "https://dump.raioviajante.com/pt/posts/uma-obra",
    description: "d",
    ...extra,
  });
  const validate = (entries) =>
    checkIndexLocale(
      "dump",
      "/pt/search-index.json",
      entries,
      "pt-BR",
      ["/pt/posts/uma-obra", "/pt/posts/outra-obra"],
      ["/pt/posts/uma-obra", "/pt/posts/outra-obra"],
    );
  assert.match(
    validate([]).join(),
    /empty index despite 2 published searchable/,
  );
  assert.deepEqual(validate([dump()]), []);
  assert.match(validate([dump({ contentId: undefined })]).join(), /contentId/);
  assert.match(
    validate([dump({ contentId: "Not valid" })]).join(),
    /contentId/,
  );
  assert.match(
    validate([
      dump(),
      dump({ href: "https://dump.raioviajante.com/pt/posts/outra-obra" }),
    ]).join(),
    /duplicate content ids/,
  );
  assert.match(
    validate([
      dump({ href: "https://dump.raioviajante.com/pt/posts/fantasma" }),
    ]).join(),
    /absent from the published sitemap inventory/,
  );
  assert.match(
    validate([dump({ href: "not a url" })]).join(),
    /do not link to a pt-BR page/,
  );
  assert.deepEqual(
    validate([
      dump(),
      dump({
        contentId: undefined,
        title: "Uma seção",
        href: "https://dump.raioviajante.com/pt/posts/uma-obra#uma-secao",
        number: "01.",
      }),
    ]),
    [],
  );
});

test("a locale with only non-searchable structural pages may publish an empty index", () => {
  assert.deepEqual(
    checkIndexLocale(
      "dump",
      "/pt/search-index.json",
      [],
      "pt-BR",
      ["/pt", "/pt/archive", "/pt/tags"],
      [],
    ),
    [],
  );
});
