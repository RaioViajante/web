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
import { projects } from "../lib/projects.ts";
import { affiliateDisclosure, gear } from "../lib/setup.ts";
import {
  ptContact,
  ptNavigation,
  ptDocsHome,
  ptDumpHome,
  ptLabHome,
  ptNotFound,
  ptPageSeo,
  ptProjects,
  ptProjectsPage,
  ptGallery,
  ptGalleryCopy,
  ptGearCategories,
  ptSearchDescriptions,
  ptSetup,
  ptThisSite,
} from "../lib/pt.ts";

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
  assert.deepEqual(counterpartsOf("contact", "en"), [
    { locale: "pt-BR", path: "/pt/contact" },
  ]);
  assert.deepEqual(counterpartsOf("projects", "en"), [
    { locale: "pt-BR", path: "/pt/projects" },
  ]);
  assert.deepEqual(counterpartsOf("this-site", "en"), [
    { locale: "pt-BR", path: "/pt/this-site" },
  ]);
  assert.deepEqual(counterpartsOf("this-site", "pt-BR"), [
    { locale: "en", path: "/this-site" },
  ]);
  assert.deepEqual(counterpartsOf("setup", "en"), [
    { locale: "pt-BR", path: "/pt/setup" },
  ]);
  assert.deepEqual(counterpartsOf("setup", "pt-BR"), [
    { locale: "en", path: "/setup" },
  ]);
  assert.deepEqual(counterpartsOf("gallery", "en"), [
    { locale: "pt-BR", path: "/pt/gallery" },
  ]);
  assert.deepEqual(counterpartsOf("gallery", "pt-BR"), [
    { locale: "en", path: "/gallery" },
  ]);
});

test("legal pages are declared in both languages with reciprocal counterparts", () => {
  for (const key of ["terms", "privacy"]) {
    assert.deepEqual(Object.keys(routes[key]), ["en", "pt-BR"]);
    assert.deepEqual(counterpartsOf(key, "en"), [
      { locale: "pt-BR", path: `/pt/${key}` },
    ]);
    assert.deepEqual(counterpartsOf(key, "pt-BR"), [
      { locale: "en", path: `/${key}` },
    ]);
  }
});

test("the shipped Portuguese pages include the translated This Site route", () => {
  assert.deepEqual(
    declaredPages()
      .filter((page) => page.locale === "pt-BR")
      .map((page) => page.path)
      .sort(),
    [
      "/pt",
      "/pt/about",
      "/pt/contact",
      "/pt/gallery",
      "/pt/privacy",
      "/pt/projects",
      "/pt/search",
      "/pt/setup",
      "/pt/terms",
      "/pt/this-site",
    ],
  );
  assert.deepEqual(publishedLocales(), ["en", "pt-BR"]);
});

test("a path resolves to its route and locale, and an undeclared one does not", () => {
  assert.deepEqual(routeOfPath("/pt/about"), { key: "about", locale: "pt-BR" });
  assert.deepEqual(routeOfPath("/pt/gallery"), {
    key: "gallery",
    locale: "pt-BR",
  });
  assert.deepEqual(routeOfPath("/pt/terms"), { key: "terms", locale: "pt-BR" });
  assert.equal(routeOfPath("/pt/missing"), undefined);
});

test("Root participation activates only its published Portuguese routes", () => {
  assert.equal(participates("root", "pt-BR"), true);
  for (const key of [
    "home",
    "about",
    "projects",
    "contact",
    "gallery",
    "this-site",
    "setup",
    "terms",
    "privacy",
    "search",
  ])
    assert.ok(routes[key]["pt-BR"], key);
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
    [
      "/pt",
      "/pt/about",
      "/pt/contact",
      "/pt/gallery",
      "/pt/privacy",
      "/pt/projects",
      "/pt/search",
      "/pt/setup",
      "/pt/terms",
      "/pt/this-site",
    ],
  );
  assert.equal(participates("dump", "pt-BR"), true);
});

test("Portuguese cross-site links use every active Portuguese homepage", () => {
  const destinations = [ptDumpHome, ptDocsHome, ptLabHome];
  assert.deepEqual(
    destinations.map(({ hrefLang }) => hrefLang),
    ["pt-BR", "pt-BR", "pt-BR"],
  );
  assert.deepEqual(
    destinations.map(({ href }) => href),
    [
      "https://dump.raioviajante.com/pt",
      "https://docs.raioviajante.com/pt/",
      "https://lab.raioviajante.com/pt/",
    ],
  );
  assert.deepEqual(
    ptNotFound.tryInstead
      .filter(({ hrefLang }) => hrefLang === "pt-BR")
      .map(({ href }) => href),
    destinations.map(({ href }) => href),
  );
  assert.equal(
    ptNotFound.tryInstead.some(({ value }) => value.includes("(em inglês)")),
    false,
  );
});

test("Portuguese Contact has complete route-facing copy", () => {
  assert.equal(ptPageSeo.contact?.title, "contato");
  assert.equal(ptSearchDescriptions.contact, "Formas de entrar em contato");
  assert.equal(ptContact.messageItems.length, 4);
  for (const value of Object.values(ptContact).flat())
    assert.ok(typeof value === "string" && value.length > 0);
});

test("Portuguese This Site has route, SEO, search and page copy", () => {
  assert.equal(routes["this-site"]["pt-BR"], "/pt/this-site");
  assert.equal(ptPageSeo["this-site"]?.title, "este site");
  assert.equal(
    ptSearchDescriptions["this-site"],
    "Como este site é construído",
  );
  assert.equal(ptThisSite.builtItems.length, 5);
  for (const value of Object.values(ptThisSite).flat())
    assert.ok(typeof value === "string" && value.length > 0);
});

test("Portuguese Gallery has route, SEO, search, page and widget copy", () => {
  assert.equal(routes.gallery["pt-BR"], "/pt/gallery");
  assert.equal(ptPageSeo.gallery?.title, "galeria");
  assert.equal(ptSearchDescriptions.gallery, "Arte e imagens");
  assert.ok(ptNavigation.some(({ key }) => key === "gallery"));
  for (const value of Object.values(ptGallery))
    assert.ok(typeof value === "string" && value.length > 0);
  const strings = (value) =>
    typeof value === "string"
      ? [value]
      : Object.values(value ?? {}).flatMap(strings);
  for (const value of strings(ptGalleryCopy)) assert.ok(value.length > 0);
  // Every authored artwork has its own alt text; titles are deliberately absent.
  assert.deepEqual(
    Object.keys(ptGalleryCopy.alts).sort(),
    [
      "candle",
      "castle",
      "cats",
      "calves",
      "cow",
      "ferry",
      "forest",
      "hospital",
      "lab",
      "mirror",
      "portrait",
      "profile-hmm",
      "profile-laptop",
      "sunset",
    ].sort(),
  );
  assert.deepEqual(Object.keys(ptGalleryCopy.categories), [
    "branding",
    "profiles",
    "personal",
  ]);
  assert.equal(ptGalleryCopy.ui.files.one, "{n} arquivo");
  assert.equal(ptGalleryCopy.ui.files.other, "{n} arquivos");
  for (const key of ["saves", "savesFolders", "saved"])
    assert.match(ptGalleryCopy.ui[key], /\{filename\}/);
});

test("Portuguese Setup translates the copy and keeps the gear facts", () => {
  assert.equal(routes.setup["pt-BR"], "/pt/setup");
  assert.equal(ptPageSeo.setup?.title, "setup");
  assert.equal(ptSearchDescriptions.setup, "Ferramentas e setup");
  for (const value of Object.values(ptSetup))
    assert.ok(typeof value === "string" && value.length > 0);
  for (const item of gear)
    assert.ok(ptGearCategories[item.category], item.category);
});

test("Setup discloses affiliate links in both languages", () => {
  assert.ok(gear.some((item) => item.url));
  assert.match(affiliateDisclosure, /affiliate links/);
  assert.match(affiliateDisclosure, /commission/);
  assert.match(ptSetup.disclosure, /links de afiliado/);
  assert.match(ptSetup.disclosure, /comissão/);
  assert.ok(gear.every((item) => !item.url || item.url.startsWith("https://")));
});

test("Portuguese projects localize presentation and preserve stable facts", () => {
  assert.equal(ptPageSeo.projects?.title, "projetos");
  assert.equal(ptSearchDescriptions.projects, "Projetos e trabalhos");
  assert.equal(ptProjectsPage.type, "Tipo:");
  assert.equal(ptProjects.length, projects.length);
  for (const [index, project] of projects.entries()) {
    const translated = ptProjects[index];
    assert.deepEqual(
      {
        name: translated.name,
        year: translated.year,
        href: translated.href,
      },
      { name: project.name, year: project.year, href: project.href },
    );
    assert.notEqual(translated.description, project.description);
    assert.notEqual(translated.kind, project.kind);
    assert.notEqual(translated.status, project.status);
  }
});
