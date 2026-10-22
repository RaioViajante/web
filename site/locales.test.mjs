import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_IDS,
  isLocaleId,
  isReservedPath,
  localeById,
  localeOfPath,
  localeParticipation,
  localizedPath,
  participates,
  stripLocalePrefix,
  trailingSlash,
} from "./locales.ts";
import { SITES } from "./sites.ts";

const siteIds = SITES.map((site) => site.id);

test("the registry supports exactly English and Brazilian Portuguese", () => {
  assert.deepEqual([...LOCALE_IDS], ["en", "pt-BR"]);
  for (const id of LOCALE_IDS) assert.equal(LOCALES[id].id, id);
  assert.equal(DEFAULT_LOCALE, "en");
});

test("English protocol mappings match docs/i18n.md", () => {
  assert.deepEqual(LOCALES.en, {
    id: "en",
    language: "en",
    region: null,
    urlPrefix: "",
    htmlLang: "en",
    hreflang: "en",
    openGraphLocale: "en_US",
    inLanguage: "en",
    rssLanguage: "en",
    intlLocale: "en-US",
    name: "English",
    label: "EN",
  });
});

test("Brazilian Portuguese protocol mappings match docs/i18n.md", () => {
  assert.deepEqual(LOCALES["pt-BR"], {
    id: "pt-BR",
    language: "pt",
    region: "BR",
    urlPrefix: "/pt",
    htmlLang: "pt-BR",
    hreflang: "pt-BR",
    openGraphLocale: "pt_BR",
    inLanguage: "pt-BR",
    rssLanguage: "pt-BR",
    intlLocale: "pt-BR",
    name: "Português (Brasil)",
    label: "PT",
  });
});

test("the registry has no per-language booleans and every locale is complete", () => {
  for (const id of LOCALE_IDS)
    for (const [key, value] of Object.entries(LOCALES[id])) {
      assert.notEqual(typeof value, "boolean", `${id}.${key}`);
      if (key !== "region")
        assert.equal(typeof value, "string", `${id}.${key}`);
    }
});

test("only the default locale is unprefixed and prefixes are unique path segments", () => {
  const prefixes = LOCALE_IDS.map((id) => LOCALES[id].urlPrefix);
  assert.deepEqual(
    LOCALE_IDS.filter((id) => LOCALES[id].urlPrefix === ""),
    [DEFAULT_LOCALE],
  );
  assert.equal(new Set(prefixes).size, prefixes.length);
  for (const prefix of prefixes.filter(Boolean))
    assert.match(prefix, /^\/[^/]+$/);
  assert.equal(
    prefixes.includes("/en"),
    false,
    "English is never served under /en",
  );
});

test("isLocaleId accepts only registry ids, whatever it is given", () => {
  assert.equal(isLocaleId("en"), true);
  assert.equal(isLocaleId("pt-BR"), true);
  for (const value of [
    "pt",
    "pt-br",
    "PT-BR",
    "pt_BR",
    "en-US",
    "fr",
    "",
    "toString",
    "__proto__",
    undefined,
    null,
    1,
    {},
  ])
    assert.equal(isLocaleId(value), false, String(value));
  assert.equal(localeById("pt-BR").label, "PT");
});

test("Dump alone participates in Portuguese; English remains active everywhere", () => {
  assert.deepEqual(
    Object.keys(localeParticipation).sort(),
    [...siteIds].sort(),
  );
  assert.deepEqual(Object.keys(trailingSlash).sort(), [...siteIds].sort());
  for (const site of siteIds) {
    assert.deepEqual(
      Object.keys(localeParticipation[site]).sort(),
      [...LOCALE_IDS].sort(),
    );
    assert.equal(participates(site, "en"), true, `${site} en`);
    assert.equal(participates(site, "pt-BR"), site === "dump", `${site} pt-BR`);
  }
});

test("the default locale participates everywhere", () => {
  for (const site of siteIds)
    assert.equal(participates(site, DEFAULT_LOCALE), true);
});

test("the trailing-slash table agrees with the Astro configuration", () => {
  for (const site of siteIds) {
    if (trailingSlash[site] === "never") continue;
    const config = readFileSync(
      new URL(`../apps/${site}/astro.config.mjs`, import.meta.url),
      "utf8",
    );
    assert.match(config, /trailingSlash:\s*"always"/, site);
  }
  for (const site of ["root", "dump"])
    assert.equal(
      trailingSlash[site],
      "never",
      `${site} is a Next.js app without trailing slashes`,
    );
});

test("only the exact first segment pt is reserved and selects Portuguese", () => {
  for (const path of [
    "/pt",
    "/pt/",
    "/pt/about",
    "/pt/posts/hello/",
    "/pt/pt",
  ]) {
    assert.equal(isReservedPath(path), true, path);
    assert.equal(localeOfPath(path), "pt-BR", path);
  }
  for (const path of [
    "/",
    "/about",
    "/ptx",
    "/ptx/",
    "/pt-debugging",
    "/p",
    "/PT",
    "/Pt/about",
    "/pt.html",
    "/foo/pt",
    "/foo/pt/",
    "/posts/pt-debugging",
    "/docs/http",
    "/http/",
    "/experiments/pt-example/",
  ]) {
    assert.equal(isReservedPath(path), false, path);
    assert.equal(localeOfPath(path), "en", path);
  }
});

test("paths that are not absolute are rejected, not guessed", () => {
  for (const path of [
    "",
    "pt",
    "pt/about",
    "//pt",
    "//evil.example/pt",
    undefined,
    null,
    1,
  ])
    for (const fn of [localeOfPath, isReservedPath, stripLocalePrefix])
      assert.throws(() => fn(path), RangeError, `${fn.name}(${String(path)})`);
  assert.throws(() => localizedPath("root", "pt-BR", "about"), RangeError);
});

test("helpers take pathnames only: a query or fragment is rejected, not interpreted", () => {
  for (const path of [
    "/pt?x=1",
    "/pt#section",
    "/pt/about?x=1",
    "/pt/about#section",
    "/about?x=1",
    "/about#section",
  ]) {
    for (const fn of [localeOfPath, isReservedPath, stripLocalePrefix])
      assert.throws(() => fn(path), RangeError, `${fn.name}(${path})`);
    for (const locale of LOCALE_IDS)
      assert.throws(
        () => localizedPath("root", locale, path),
        RangeError,
        `localizedPath(${locale}, ${path})`,
      );
  }
});

test("stripLocalePrefix returns the locale-neutral path and keeps the host form", () => {
  assert.equal(stripLocalePrefix("/pt"), "/");
  assert.equal(stripLocalePrefix("/pt/"), "/");
  assert.equal(stripLocalePrefix("/pt/about"), "/about");
  assert.equal(stripLocalePrefix("/pt/search/"), "/search/");
  assert.equal(
    stripLocalePrefix("/pt/pt"),
    "/pt",
    "only one prefix is removed",
  );
  for (const path of [
    "/",
    "/about",
    "/ptx",
    "/foo/pt",
    "/posts/pt-debugging",
    "/PT",
  ])
    assert.equal(stripLocalePrefix(path), path);
});

test("English paths are never changed", () => {
  for (const site of siteIds)
    for (const path of [
      "/",
      "/about",
      "/search/",
      "/posts/pt-debugging",
      "/rss.xml",
      "/foo/pt/",
    ])
      assert.equal(localizedPath(site, "en", path), path, `${site} ${path}`);
});

test("Portuguese paths follow each host's trailing-slash convention", () => {
  for (const site of ["root", "dump"]) {
    assert.equal(localizedPath(site, "pt-BR", "/"), "/pt", site);
    assert.equal(localizedPath(site, "pt-BR", "/about"), "/pt/about", site);
    assert.equal(
      localizedPath(site, "pt-BR", "/posts/hello"),
      "/pt/posts/hello",
      site,
    );
  }
  for (const site of ["docs", "lab"]) {
    assert.equal(localizedPath(site, "pt-BR", "/"), "/pt/", site);
    assert.equal(localizedPath(site, "pt-BR", "/search/"), "/pt/search/", site);
    assert.equal(
      localizedPath(site, "pt-BR", "/experiments/pt-example/"),
      "/pt/experiments/pt-example/",
      site,
    );
  }
});

test("localizedPath keeps the received form of non-root paths", () => {
  assert.equal(localizedPath("dump", "pt-BR", "/rss.xml"), "/pt/rss.xml");
  assert.equal(
    localizedPath("root", "pt-BR", "/search-index.json"),
    "/pt/search-index.json",
  );
});

test("localizedPath round-trips through stripLocalePrefix and localeOfPath", () => {
  for (const site of siteIds)
    for (const path of [
      "/",
      trailingSlash[site] === "always" ? "/search/" : "/search",
      "/ptx",
      "/foo/pt",
    ]) {
      const localized = localizedPath(site, "pt-BR", path);
      assert.equal(localeOfPath(localized), "pt-BR", localized);
      assert.equal(stripLocalePrefix(localized), path, localized);
    }
});

test("localizedPath rejects unsupported locales and paths that are already prefixed", () => {
  for (const locale of [
    "pt",
    "pt-br",
    "en-US",
    "fr",
    "",
    undefined,
    "__proto__",
  ])
    assert.throws(
      () => localizedPath("root", locale, "/about"),
      RangeError,
      String(locale),
    );
  for (const locale of LOCALE_IDS)
    for (const path of ["/pt", "/pt/", "/pt/about"])
      assert.throws(
        () => localizedPath("docs", locale, path),
        RangeError,
        `${locale} ${path}`,
      );
});
