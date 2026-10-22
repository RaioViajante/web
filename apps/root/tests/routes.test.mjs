import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";
import { checkLocaleInventory } from "../../../seo/locale.ts";
import {
  isReservedPath,
  localeParticipation,
  localeOfPath,
  participates,
} from "../../../site/locales.ts";
import {
  counterpartsOf,
  declaredPages,
  publishedLocales,
  routeOfPath,
  routes,
} from "../lib/routes.ts";
import { ptDumpHome, ptNotFound } from "../lib/pt.ts";

// Root's route registry is the one record of which pages exist in which
// locale. These checks keep it honest in both directions (docs/i18n.md, "Route
// and counterpart model"). Root has no framework test runner; this is Node's
// built-in one and imports no framework code.

const app = new URL("../app/", import.meta.url).pathname;

/** The paths of every `page.tsx` under app/, as routes (no dynamic segments exist). */
function builtPages(dir = app) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return builtPages(full);
    if (name !== "page.tsx") return [];
    const route = "/" + relative(app, dir).split(sep).join("/");
    return [route === "/." ? "/" : route.replace(/\/$/, "") || "/"];
  });
}

test("every declared path is a real built page, and every built page is declared", () => {
  const declared = declaredPages()
    .map((page) => page.path)
    .sort();
  assert.deepEqual(builtPages().sort(), declared);
});

test("the registry passes the shared inventory checks for Root", () => {
  assert.deepEqual(
    checkLocaleInventory(
      "root",
      declaredPages().map(({ locale, path, counterparts }) => ({
        locale,
        path,
        counterparts,
      })),
    ),
    [],
  );
});

test("each path belongs to the locale it is declared under", () => {
  for (const { locale, path } of declaredPages())
    assert.equal(localeOfPath(path), locale, path);
});

test("English paths are unprefixed and unchanged", () => {
  const english = Object.fromEntries(
    Object.entries(routes).map(([key, paths]) => [key, paths.en]),
  );
  assert.deepEqual(english, {
    home: "/",
    about: "/about",
    projects: "/projects",
    contact: "/contact",
    gallery: "/gallery",
    "this-site": "/this-site",
    setup: "/setup",
    terms: "/terms",
    privacy: "/privacy",
    search: "/search",
  });
  for (const path of Object.values(english))
    assert.equal(isReservedPath(path), false);
});

test("counterparts are the other declared locales, never guessed", () => {
  assert.deepEqual(counterpartsOf("about", "en"), [
    { locale: "pt-BR", path: "/pt/about" },
  ]);
  assert.deepEqual(counterpartsOf("about", "pt-BR"), [
    { locale: "en", path: "/about" },
  ]);
  for (const key of ["projects", "contact", "gallery", "this-site", "setup"])
    assert.deepEqual(counterpartsOf(key, "en"), [], key);
});

test("legal pages stay English-only until reviewed Portuguese text exists", () => {
  assert.deepEqual(Object.keys(routes.terms), ["en"]);
  assert.deepEqual(Object.keys(routes.privacy), ["en"]);
});

test("the shipped Portuguese pages are exactly Home, About and Search", () => {
  assert.deepEqual(
    declaredPages()
      .filter((page) => page.locale === "pt-BR")
      .map((page) => page.path)
      .sort(),
    ["/pt", "/pt/about", "/pt/search"],
  );
  assert.deepEqual(publishedLocales(), ["en", "pt-BR"]);
});

test("a path resolves to its route and locale, and an undeclared one does not", () => {
  assert.deepEqual(routeOfPath("/pt/about"), { key: "about", locale: "pt-BR" });
  assert.equal(routeOfPath("/pt/gallery"), undefined);
});

test("Root participation activates only its published Portuguese routes", () => {
  assert.equal(participates("root", "pt-BR"), true);
  for (const key of ["home", "about", "search"])
    assert.ok(routes[key]["pt-BR"], key);
  for (const key of [
    "projects",
    "contact",
    "gallery",
    "this-site",
    "setup",
    "terms",
    "privacy",
  ])
    assert.equal(routes[key]["pt-BR"], undefined, key);
});

test("rollback disables Root participation while its Portuguese routes stay published", (t) => {
  t.after(() => {
    localeParticipation.root["pt-BR"] = true;
  });
  localeParticipation.root["pt-BR"] = false;
  assert.equal(participates("root", "pt-BR"), false);
  assert.deepEqual(
    declaredPages()
      .filter(({ locale }) => locale === "pt-BR")
      .map(({ path }) => path)
      .sort(),
    ["/pt", "/pt/about", "/pt/search"],
  );
  assert.equal(participates("dump", "pt-BR"), true);
});

test("Portuguese 404 recovery links identify deliberate English destinations", () => {
  const english = ptNotFound.tryInstead.filter(
    ({ hrefLang }) => hrefLang === "en",
  );
  assert.equal(english.length, 2);
  assert.deepEqual(
    ptNotFound.tryInstead
      .filter(({ hrefLang }) => hrefLang === "pt-BR")
      .map(({ href }) => href),
    [ptDumpHome.href],
  );
  assert.equal(
    english.every(({ hrefLang }) => hrefLang === "en"),
    true,
  );
  assert.equal(
    english.every(({ value }) => value.includes("(em inglês)")),
    true,
  );
});
