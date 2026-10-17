import assert from "node:assert/strict";
import test from "node:test";
import { alternateCluster, checkLocaleInventory } from "./locale.ts";
import {
  isNotFoundPath,
  isSearchPath,
  notFoundMetadata,
  pageMetadata,
  sitemapResponse,
  socialKey,
  socialUrl,
} from "./metadata.ts";
import {
  checkAlternateReciprocity,
  checkDocument,
  checkEntityLanguages,
  checkJsonLd,
  checkNotFoundPage,
  checkSearchPage,
  checkSitemap,
  checkUniqueness,
  expectedTypes,
  parseDocument,
  searchPathFor,
} from "./metadata-policy.ts";
import {
  breadcrumbJsonLd,
  inLanguageOf,
  jsonLdScript,
  personRef,
  webPageRef,
  websiteJsonLd,
} from "./structured-data.ts";

// Contract fixtures. No Portuguese route exists in any app: every page below is
// a fixture the app would supply, and nothing here is read from an app.
const DUMP = "https://dump.raioviajante.com";
const DOCS = "https://docs.raioviajante.com";
const en = (path, counterparts) => ({ locale: "en", path, counterparts });
const pt = (path, counterparts) => ({ locale: "pt-BR", path, counterparts });
const hrefs = (cluster) =>
  Object.fromEntries(cluster.links.map((l) => [l.hreflang, l.href]));

// ---------------------------------------------------------------- clusters

test("A: an English page with a Portuguese counterpart lists both and x-default", () => {
  const cluster = alternateCluster(
    DUMP,
    en("/posts/hello", [{ locale: "pt-BR", path: "/pt/posts/ola" }]),
  );
  assert.deepEqual(hrefs(cluster), {
    en: `${DUMP}/posts/hello`,
    "pt-BR": `${DUMP}/pt/posts/ola`,
    "x-default": `${DUMP}/posts/hello`,
  });
  assert.deepEqual(cluster.ogAlternates, ["pt_BR"]);
});

test("B: a Portuguese page with an English counterpart is the same cluster", () => {
  const cluster = alternateCluster(
    DUMP,
    pt("/pt/posts/ola", [{ locale: "en", path: "/posts/hello" }]),
  );
  assert.deepEqual(hrefs(cluster), {
    en: `${DUMP}/posts/hello`,
    "pt-BR": `${DUMP}/pt/posts/ola`,
    "x-default": `${DUMP}/posts/hello`,
  });
  assert.deepEqual(cluster.ogAlternates, ["en_US"]);
  const fromEnglish = alternateCluster(
    DUMP,
    en("/posts/hello", [{ locale: "pt-BR", path: "/pt/posts/ola" }]),
  );
  assert.deepEqual(
    [...cluster.links].sort((a, b) => a.hreflang.localeCompare(b.hreflang)),
    [...fromEnglish.links].sort((a, b) => a.hreflang.localeCompare(b.hreflang)),
  );
});

test("C and D: a page without a declared counterpart has no cluster at all", () => {
  for (const page of [
    en("/posts/untranslated"),
    en("/posts/x", []),
    pt("/pt/posts/so-pt"),
    pt("/pt/posts/so-pt", []),
  ])
    assert.equal(alternateCluster(DUMP, page), undefined, page.path);
});

test("E: different localized slugs are supported because nothing is inferred", () => {
  const cluster = alternateCluster(
    DUMP,
    en("/posts/learning-rust", [
      { locale: "pt-BR", path: "/pt/posts/aprendendo-rust" },
    ]),
  );
  assert.equal(hrefs(cluster)["pt-BR"], `${DUMP}/pt/posts/aprendendo-rust`);
  // The same path swapped between locales is not guessed either.
  assert.equal(alternateCluster(DUMP, en("/posts/learning-rust")), undefined);
});

test("G and H: the host's own trailing-slash form is preserved", () => {
  const next = alternateCluster(
    DUMP,
    en("/about", [{ locale: "pt-BR", path: "/pt/about" }]),
  );
  assert.equal(hrefs(next)["pt-BR"], `${DUMP}/pt/about`);
  const astro = alternateCluster(
    DOCS,
    en("/guide/", [{ locale: "pt-BR", path: "/pt/guide/" }]),
  );
  assert.deepEqual(hrefs(astro), {
    en: `${DOCS}/guide/`,
    "pt-BR": `${DOCS}/pt/guide/`,
    "x-default": `${DOCS}/guide/`,
  });
  const home = alternateCluster(
    DOCS,
    en("/", [{ locale: "pt-BR", path: "/pt/" }]),
  );
  assert.equal(hrefs(home)["pt-BR"], `${DOCS}/pt/`);
});

test("I: x-default is the English member and never invented", () => {
  const cluster = alternateCluster(
    DUMP,
    pt("/pt/a", [{ locale: "en", path: "/b" }]),
  );
  assert.equal(hrefs(cluster)["x-default"], `${DUMP}/b`);
  assert.equal(
    cluster.links.filter((l) => l.hreflang === "x-default").length,
    1,
  );
});

test("contradictory facts are refused rather than serialized", () => {
  assert.throws(
    () => alternateCluster(DUMP, en("/a", [{ locale: "pt-BR", path: "/a" }])),
    RangeError,
    "wrong locale for the path",
  );
  assert.throws(
    () =>
      alternateCluster(DUMP, en("/pt/a", [{ locale: "pt-BR", path: "/pt/a" }])),
    RangeError,
    "page not in its own locale",
  );
  assert.throws(
    () => alternateCluster(DUMP, en("/a", [{ locale: "en", path: "/b" }])),
    RangeError,
    "same locale twice",
  );
  assert.throws(
    () =>
      alternateCluster(
        DUMP,
        en("/a", [
          { locale: "pt-BR", path: "/pt/a" },
          { locale: "pt-BR", path: "/pt/b" },
        ]),
      ),
    RangeError,
    "duplicate hreflang",
  );
  assert.throws(
    () => alternateCluster(DUMP, en("/a", [{ locale: "fr", path: "/fr/a" }])),
    RangeError,
    "unsupported locale",
  );
});

// --------------------------------------------------------------- metadata

test("English metadata keeps its canonical and gains only og:locale", () => {
  const meta = pageMetadata(DOCS, "docs", {
    path: "/projects/sweep/",
    title: "Sweep",
    description: "d",
  });
  assert.deepEqual(meta.alternates, { canonical: "/projects/sweep/" });
  assert.equal(meta.openGraph.url, `${DOCS}/projects/sweep/`);
  assert.equal(meta.openGraph.locale, "en_US");
  assert.ok(!("alternateLocale" in meta.openGraph));
});

test("a Portuguese page canonicalizes to itself, with its own Open Graph locale", () => {
  const meta = pageMetadata(DUMP, "dump", {
    path: "/pt/posts/ola",
    locale: "pt-BR",
    title: "Olá",
    description: "d",
    counterparts: [{ locale: "en", path: "/posts/hello" }],
  });
  assert.equal(meta.alternates.canonical, "/pt/posts/ola");
  assert.equal(meta.openGraph.url, `${DUMP}/pt/posts/ola`);
  assert.equal(meta.openGraph.locale, "pt_BR");
  assert.deepEqual(meta.openGraph.alternateLocale, ["en_US"]);
  assert.deepEqual(meta.alternates.languages, {
    en: `${DUMP}/posts/hello`,
    "pt-BR": `${DUMP}/pt/posts/ola`,
    "x-default": `${DUMP}/posts/hello`,
  });
  assert.equal(meta.openGraph.images[0].url, `${DUMP}/og/pt/posts/ola.png`);
});

test("an English page with a counterpart advertises exactly that locale", () => {
  const meta = pageMetadata(DUMP, "dump", {
    path: "/posts/hello",
    title: "Hello",
    description: "d",
    counterparts: [{ locale: "pt-BR", path: "/pt/posts/ola" }],
  });
  assert.equal(meta.alternates.canonical, "/posts/hello");
  assert.equal(meta.openGraph.locale, "en_US");
  assert.deepEqual(meta.openGraph.alternateLocale, ["pt_BR"]);
});

test("a page alone advertises no alternate, whatever the registry supports", () => {
  for (const page of [
    { path: "/about", title: "About", description: "d" },
    { path: "/pt/about", locale: "pt-BR", title: "Sobre", description: "d" },
  ]) {
    const meta = pageMetadata(DUMP, "dump", page);
    assert.ok(!("languages" in meta.alternates), page.path);
    assert.ok(!("alternateLocale" in meta.openGraph), page.path);
  }
});

test("a localized home page keeps the full-site title", () => {
  const meta = pageMetadata(DOCS, "docs", {
    path: "/pt/",
    locale: "pt-BR",
    title: "docs",
    description: "d",
  });
  assert.equal(meta.title.absolute, "docs");
});

test("social cards accept localized paths and text", () => {
  assert.equal(socialKey("/pt/posts/ola"), "pt/posts/ola.png");
  assert.equal(socialKey("/pt"), "pt.png");
  assert.equal(socialUrl(DUMP, "/pt/posts/ola"), `${DUMP}/og/pt/posts/ola.png`);
  const meta = pageMetadata(DUMP, "dump", {
    path: "/pt/posts/ola",
    locale: "pt-BR",
    title: "Olá, mundo",
    description: "Uma nota.",
  });
  assert.equal(meta.openGraph.title, "Olá, mundo — dump");
  assert.equal(meta.openGraph.images[0].alt, "Olá, mundo — dump");
  assert.equal(meta.twitter.description, "Uma nota.");
});

// ------------------------------------------------------- search and 404

test("J: both search pages are noindex and never in a sitemap", async () => {
  for (const path of ["/search", "/search/", "/pt/search", "/pt/search/"])
    assert.equal(isSearchPath(path), true, path);
  for (const path of [
    "/ptx/search",
    "/pt/search/x",
    "/foo/pt/search",
    "/PT/search",
  ])
    assert.equal(isSearchPath(path), false, path);
  const meta = pageMetadata(DUMP, "dump", {
    path: "/pt/search",
    locale: "pt-BR",
    title: "Busca",
    description: "d",
  });
  assert.deepEqual(meta.robots, { index: false, follow: true });
  assert.equal(meta.alternates.canonical, "/pt/search");
  const xml = await sitemapResponse(DUMP, [
    "/",
    "/pt",
    "/search",
    "/pt/search",
    "/pt/search/",
    "/pt/about",
  ]).text();
  assert.ok(!xml.includes("search"));
  assert.ok(xml.includes("/pt/about"));
});

test("search paths are built per host and locale", () => {
  assert.equal(searchPathFor("root"), "/search");
  assert.equal(searchPathFor("dump", "pt-BR"), "/pt/search");
  assert.equal(searchPathFor("docs"), "/search/");
  assert.equal(searchPathFor("lab", "pt-BR"), "/pt/search/");
});

test("the search page check follows the locale: one bare canonical and its lang", () => {
  const search = (lang, canonical) =>
    `<html lang="${lang}"><head><meta name="robots" content="noindex, follow"/><link rel="canonical" href="${canonical}"/><meta property="og:locale" content="${lang === "en" ? "en_US" : "pt_BR"}"/></head></html>`;
  assert.deepEqual(
    checkSearchPage(
      "docs",
      search("pt-BR", `${DOCS}/pt/search/`),
      "/pt/search/?q=a",
      "pt-BR",
    ),
    [],
  );
  assert.match(
    checkSearchPage(
      "docs",
      search("en", `${DOCS}/pt/search/`),
      "/pt/search/",
      "pt-BR",
    ).join(),
    /lang> is "en", expected "pt-BR"/,
  );
  assert.match(
    checkSearchPage(
      "docs",
      search("pt-BR", `${DOCS}/search/`),
      "/pt/search/",
      "pt-BR",
    ).join(),
    /canonical is/,
  );
  assert.deepEqual(checkSearchPage("dump", search("en", `${DUMP}/search`)), []);
});

test("K: 404 pages are excluded from sitemaps and checked in either language", async () => {
  for (const path of [
    "/404",
    "/404/",
    "/404.html",
    "/pt/404",
    "/pt/404/",
    "/pt/404.html",
  ])
    assert.equal(isNotFoundPath(path), true, path);
  assert.equal(isNotFoundPath("/pt/404-notes/"), false);
  const xml = await sitemapResponse(DUMP, ["/", "/pt/404", "/404"]).text();
  assert.ok(!xml.includes("404"));
  const meta = notFoundMetadata(DUMP, "dump", "pt-BR");
  assert.deepEqual(meta.robots, { index: false });
  assert.deepEqual(meta.alternates, {});
  assert.equal(meta.openGraph.locale, "pt_BR");
  assert.ok(!("alternateLocale" in meta.openGraph));
  assert.equal(notFoundMetadata(DUMP, "dump").openGraph.locale, "en_US");

  const page = (
    lang,
    extra = "",
    robots = '<meta name="robots" content="noindex"/>',
  ) => `<html lang="${lang}"><head>${robots}${extra}</head></html>`;
  const ok = {
    path: "/pt/missing",
    status: 404,
    html: page("pt-BR"),
    lang: "pt-BR",
  };
  assert.deepEqual(checkNotFoundPage("root", ok), []);
  assert.deepEqual(
    checkNotFoundPage("docs", {
      ...ok,
      path: "/404.html",
      html: page("en"),
      lang: "en",
    }),
    [],
  );
  const bad = (change) =>
    checkNotFoundPage("root", { ...ok, ...change }).join("\n");
  assert.match(bad({ status: 200 }), /HTTP 200, expected 404/);
  assert.match(bad({ html: page("pt-BR", "", "") }), /not noindex/);
  assert.match(
    bad({
      html: page(
        "pt-BR",
        '<link rel="canonical" href="https://raioviajante.com/pt/x"/>',
      ),
    }),
    /declares a canonical/,
  );
  assert.match(
    bad({
      html: page(
        "pt-BR",
        '<link rel="alternate" hreflang="en" href="https://raioviajante.com/x"/>',
      ),
    }),
    /declares hreflang/,
  );
  assert.match(
    bad({
      html: page(
        "pt-BR",
        '<meta property="og:locale:alternate" content="en_US"/>',
      ),
    }),
    /og:locale:alternate/,
  );
  assert.match(
    bad({ html: page("en") }),
    /lang> is "en", expected "pt-BR" for the copy/,
  );
  assert.match(bad({ sitemapPaths: ["/pt/missing"] }), /sitemap contains/);
});

// ---------------------------------------------------------------- sitemap

test("sitemaps list localized URLs as plain entries with only explicit lastmod", async () => {
  const xml = await sitemapResponse(DOCS, [
    "/",
    "/guide/",
    "/pt/",
    { path: "/pt/guide/", lastmod: "2026-10-01" },
  ]).text();
  assert.equal(xml.match(/<url>/g).length, 4);
  assert.ok(xml.includes(`<loc>${DOCS}/pt/</loc></url>`));
  assert.ok(
    xml.includes(`<loc>${DOCS}/pt/guide/</loc><lastmod>2026-10-01</lastmod>`),
  );
  assert.ok(!xml.includes("xhtml"));
});

test("sitemap policy: localized posts may carry lastmod, alternates may not live here", () => {
  const sitemap = (...urls) =>
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
  const url = (loc, lastmod) =>
    `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
  const now = new Date("2026-11-01");
  assert.deepEqual(
    checkSitemap(
      "dump",
      sitemap(
        url(`${DUMP}/`),
        url(`${DUMP}/pt`),
        url(`${DUMP}/pt/posts/ola`, "2026-10-01"),
      ),
      now,
    ).problems,
    [],
  );
  assert.match(
    checkSitemap(
      "dump",
      sitemap(url(`${DUMP}/`), url(`${DUMP}/pt/about`, "2026-10-01")),
      now,
    ).problems.join(),
    /has a lastmod, but dump has no content dates/,
  );
  assert.match(
    checkSitemap(
      "dump",
      sitemap(url(`${DUMP}/`), url(`${DUMP}/pt/404`)),
      now,
    ).problems.join(),
    /is a 404 page/,
  );
  assert.match(
    checkSitemap(
      "dump",
      sitemap(
        `<url><loc>${DUMP}/</loc><xhtml:link rel="alternate" hreflang="pt-BR" href="${DUMP}/pt"/></url>`,
      ),
      now,
    ).problems.join(),
    /xhtml:link/,
  );
});

// ----------------------------------------------------------- the documents

const COLOR = "#191919";
function document({
  site = "docs",
  path = "/guide/",
  lang = "en",
  ogLocale = "en_US",
  canonical,
  alternates = [],
  ogAlternates = [],
  extra = "",
}) {
  const origin = site === "docs" ? DOCS : DUMP;
  canonical ??= `${origin}${path}`;
  const image = `${origin}/og/x.png`;
  return `<!doctype html><html lang="${lang}"><head>
<title>T</title><meta name="description" content="D"/><link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="T"/><meta property="og:description" content="D"/><meta property="og:url" content="${canonical}"/>
<meta property="og:type" content="website"/><meta property="og:locale" content="${ogLocale}"/>
${ogAlternates.map((a) => `<meta property="og:locale:alternate" content="${a}"/>`).join("")}
<meta property="og:image" content="${image}"/><meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="T"/><meta name="twitter:description" content="D"/><meta name="twitter:image" content="${image}"/>
<meta name="theme-color" content="${COLOR}"/><link rel="icon" href="/i.ico"/><link rel="apple-touch-icon" href="/a.png"/><link rel="manifest" href="/m.json"/>
${alternates.map(([hreflang, href]) => `<link rel="alternate" hreflang="${hreflang}" href="${href}"/>`).join("")}${extra}
</head><body></body></html>`;
}
const check = (html, path = "/guide/", site = "docs") =>
  checkDocument({
    site,
    path,
    loc: `${site === "docs" ? DOCS : DUMP}${path}`,
    html,
    themeColor: COLOR,
  }).join("\n");

const enAlt = [
  ["en", `${DOCS}/guide/`],
  ["pt-BR", `${DOCS}/pt/guide/`],
  ["x-default", `${DOCS}/guide/`],
];

test("a clean English document and a clean cluster pass", () => {
  assert.equal(check(document({})), "");
  assert.equal(
    check(document({ alternates: enAlt, ogAlternates: ["pt_BR"] })),
    "",
  );
});

test("a clean Portuguese document passes with its own lang, og:locale and canonical", () => {
  const html = document({
    path: "/pt/guide/",
    lang: "pt-BR",
    ogLocale: "pt_BR",
    alternates: enAlt,
    ogAlternates: ["en_US"],
  });
  assert.equal(check(html, "/pt/guide/"), "");
});

test("lang and og:locale follow the rendered locale", () => {
  assert.match(
    check(
      document({ path: "/pt/guide/", lang: "en", ogLocale: "pt_BR" }),
      "/pt/guide/",
    ),
    /lang> is "en", expected "pt-BR"/,
  );
  assert.match(
    check(document({ lang: "pt-BR" })),
    /lang> is "pt-BR", expected "en"/,
  );
  assert.match(
    check(document({ ogLocale: "pt_BR" })),
    /og:locale is "pt_BR", expected "en_US"/,
  );
  assert.match(
    check(document({}).replace(/<meta property="og:locale"[^>]*>/, "")),
    /missing og:locale/,
  );
});

test("a Portuguese page canonical-izing to English is rejected", () => {
  const html = document({
    path: "/pt/guide/",
    lang: "pt-BR",
    ogLocale: "pt_BR",
    canonical: `${DOCS}/guide/`,
  });
  assert.match(
    check(html, "/pt/guide/"),
    /canonical .* differs from sitemap URL/,
  );
});

test("cluster rules: self, x-default, duplicates, locale of destination, og alternates", () => {
  const bad = (alternates, ogAlternates = ["pt_BR"], path = "/guide/") =>
    check(document({ path, alternates, ogAlternates }), path);
  assert.match(
    bad([
      ["pt-BR", `${DOCS}/pt/guide/`],
      ["x-default", `${DOCS}/guide/`],
    ]),
    /lacks the page's own "en"/,
  );
  assert.match(bad(enAlt.slice(0, 2)), /English member but no x-default/);
  assert.match(
    bad([...enAlt, ["pt-BR", `${DOCS}/pt/guide/`]]),
    /duplicate hreflang "pt-BR"/,
  );
  assert.match(
    bad([
      ["en", `${DOCS}/guide/`],
      ["x-default", `${DOCS}/guide/`],
    ]),
    /needs a real counterpart/,
  );
  assert.match(
    bad([
      ["en", `${DOCS}/guide/`],
      ["pt-BR", `${DOCS}/guide2/`],
      ["x-default", `${DOCS}/guide/`],
    ]),
    /belongs to en/,
  );
  assert.match(
    bad([
      ["en", `${DOCS}/guide/`],
      ["pt", `${DOCS}/pt/guide/`],
      ["x-default", `${DOCS}/guide/`],
    ]),
    /"pt" is not a supported locale/,
  );
  assert.match(
    bad([
      ["en", `${DOCS}/other/`],
      ["pt-BR", `${DOCS}/pt/guide/`],
      ["x-default", `${DOCS}/other/`],
    ]),
    /differs from canonical/,
  );
  assert.match(
    bad(
      enAlt.map(([h, u]) =>
        h === "x-default" ? [h, `${DOCS}/pt/guide/`] : [h, u],
      ),
    ),
    /x-default .* is not the English member/,
  );
  assert.match(
    bad(enAlt, []),
    /og:locale:alternate is \[\], expected \[pt_BR\]/,
  );
  assert.match(bad(enAlt, ["pt_BR", "en_US"]), /og:locale:alternate/);
  assert.match(
    bad([], ["pt_BR"]),
    /og:locale:alternate without an hreflang cluster/,
  );
});

test("no counterpart, no cluster: an alternate-free page with no og alternates passes", () => {
  assert.equal(check(document({})), "");
});

test("reciprocity: every alternate is a checked page carrying the same cluster", () => {
  const english = {
    site: "docs",
    path: "/guide/",
    html: document({ alternates: enAlt, ogAlternates: ["pt_BR"] }),
  };
  const portuguese = {
    site: "docs",
    path: "/pt/guide/",
    html: document({
      path: "/pt/guide/",
      lang: "pt-BR",
      ogLocale: "pt_BR",
      alternates: enAlt,
      ogAlternates: ["en_US"],
    }),
  };
  assert.deepEqual(checkAlternateReciprocity([english, portuguese]), []);
  assert.match(
    checkAlternateReciprocity([english]).join(),
    /alternate .*\/pt\/guide\/ is not a checked page/,
  );
  const oneWay = {
    ...portuguese,
    html: document({ path: "/pt/guide/", lang: "pt-BR", ogLocale: "pt_BR" }),
  };
  assert.match(
    checkAlternateReciprocity([english, oneWay]).join(),
    /alternate .*\/pt\/guide\/ is not a checked page/,
  );
  const different = {
    ...portuguese,
    html: document({
      path: "/pt/guide/",
      lang: "pt-BR",
      ogLocale: "pt_BR",
      alternates: [
        ["en", `${DOCS}/guide/`],
        ["pt-BR", `${DOCS}/pt/guide/`],
      ],
      ogAlternates: ["en_US"],
    }),
  };
  assert.match(
    checkAlternateReciprocity([english, different]).join(),
    /declares a different cluster/,
  );
  assert.deepEqual(
    checkAlternateReciprocity([
      { site: "docs", path: "/a/", html: document({ path: "/a/" }) },
    ]),
    [],
  );
});

// -------------------------------------------------------------- inventory

test("F: an inventory with a removed counterpart is rejected, a consistent one passes", () => {
  const good = [
    en("/posts/hello", [{ locale: "pt-BR", path: "/pt/posts/ola" }]),
    pt("/pt/posts/ola", [{ locale: "en", path: "/posts/hello" }]),
    en("/posts/untranslated"),
    pt("/pt/posts/so-pt"),
  ];
  assert.deepEqual(checkLocaleInventory("dump", good), []);
  assert.match(
    checkLocaleInventory(
      "dump",
      good.filter((r) => r.path !== "/pt/posts/ola"),
    ).join(),
    /counterpart pt-BR \/pt\/posts\/ola is not a declared public route/,
  );
});

test("inventory rules: reciprocity, locale of destination, duplicates, form and placement", () => {
  const oneWay = [en("/a", [{ locale: "pt-BR", path: "/pt/a" }]), pt("/pt/a")];
  assert.match(
    checkLocaleInventory("dump", oneWay).join(),
    /does not list \/a back/,
  );
  const wrongLocale = [
    en("/a", [{ locale: "en", path: "/pt/a" }]),
    pt("/pt/a"),
  ];
  assert.match(
    checkLocaleInventory("dump", wrongLocale).join(),
    /counterpart en \/pt\/a is declared as pt-BR/,
  );
  const misplaced = [{ locale: "pt-BR", path: "/a" }];
  assert.match(
    checkLocaleInventory("dump", misplaced).join(),
    /is not a pt-BR path/,
  );
  assert.match(
    checkLocaleInventory("dump", [en("/a"), en("/a")]).join(),
    /declared twice/,
  );
  const twice = [
    en("/a", [
      { locale: "pt-BR", path: "/pt/a" },
      { locale: "pt-BR", path: "/pt/b" },
    ]),
    pt("/pt/a", [{ locale: "en", path: "/a" }]),
    pt("/pt/b", [{ locale: "en", path: "/a" }]),
  ];
  assert.match(
    checkLocaleInventory("dump", twice).join(),
    /repeats the locale pt-BR/,
  );
  assert.match(
    checkLocaleInventory("dump", [en("/a/")]).join(),
    /trailing-slash form/,
  );
  assert.match(
    checkLocaleInventory("docs", [en("/a/"), pt("/pt/a")]).join(),
    /trailing-slash form/,
  );
  assert.deepEqual(
    checkLocaleInventory("docs", [
      en("/a/", [{ locale: "pt-BR", path: "/pt/a/" }]),
      pt("/pt/a/", [{ locale: "en", path: "/a/" }]),
    ]),
    [],
  );
  assert.deepEqual(checkLocaleInventory("docs", [en("/"), pt("/pt/")]), []);
  assert.match(
    checkLocaleInventory("docs", [pt("/pt")]).join(),
    /trailing-slash form/,
  );
});

test("inventory validation never adds a page: an empty or English-only app is fine", () => {
  assert.deepEqual(checkLocaleInventory("lab", []), []);
  assert.deepEqual(
    checkLocaleInventory("lab", [en("/"), en("/experiments/pt-example/")]),
    [],
  );
});

// --------------------------------------------------------- structured data

const ld = (html, ...nodes) =>
  html.replace(
    "</head>",
    `<script type="application/ld+json">${jsonLdScript(...nodes)}</script></head>`,
  );
const jsonLd = (path, site, html) =>
  checkJsonLd({
    site,
    path,
    loc: `${DOCS}${path}`,
    html,
    sitemapLocs: [`${DOCS}${path}`],
  }).join("\n");
const article = (locale, extra = {}) => ({
  "@type": "TechArticle",
  headline: "T",
  description: "D",
  url: `${DOCS}/guide/`,
  mainEntityOfPage: webPageRef(`${DOCS}/guide/`, locale),
  inLanguage: inLanguageOf(locale),
  isPartOf: { "@id": `${DOCS}/#website` },
  image: `${DOCS}/og/x.png`,
  ...extra,
});
const crumbs = breadcrumbJsonLd(DOCS, [
  ["docs", "/"],
  ["Guide", "/guide/"],
]);

test("structured data: content nodes use the rendered locale", () => {
  assert.equal(inLanguageOf("en"), "en");
  assert.equal(inLanguageOf("pt-BR"), "pt-BR");
  assert.doesNotMatch(
    jsonLd("/guide/", "docs", ld(document({}), article("en"), crumbs)),
    /inLanguage/,
  );
  assert.match(
    jsonLd("/guide/", "docs", ld(document({}), article("pt-BR"), crumbs)),
    /TechArticle inLanguage is "pt-BR", expected "en"/,
  );
  assert.match(
    jsonLd(
      "/pt/guide/",
      "docs",
      ld(document({ path: "/pt/guide/" }), article("en"), crumbs),
    ),
    /inLanguage is "en", expected "pt-BR"/,
  );
  assert.doesNotMatch(
    jsonLd(
      "/pt/guide/",
      "docs",
      ld(document({ path: "/pt/guide/" }), article("pt-BR"), crumbs),
    ),
    /inLanguage/,
  );
  assert.match(
    jsonLd(
      "/guide/",
      "docs",
      ld(document({}), { ...article("en"), inLanguage: undefined }, crumbs),
    ),
    /TechArticle has no inLanguage/,
  );
  const wrongPage = article("en", {
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${DOCS}/guide/`,
      inLanguage: "pt-BR",
    },
  });
  assert.match(
    jsonLd("/guide/", "docs", ld(document({}), wrongPage, crumbs)),
    /WebPage inLanguage is "pt-BR", expected "en"/,
  );
});

test("structured data: a breadcrumb never gets inLanguage", () => {
  assert.ok(!("inLanguage" in crumbs));
  assert.ok(!JSON.stringify(crumbs).includes("inLanguage"));
  const marked = { ...crumbs, inLanguage: "en" };
  assert.match(
    jsonLd("/guide/", "docs", ld(document({}), article("en"), marked)),
    /BreadcrumbList must not state inLanguage/,
  );
});

test("structured data: identity nodes never inherit the page locale", () => {
  assert.ok(!("inLanguage" in personRef()));
  const person = { ...personRef(), inLanguage: "pt-BR" };
  assert.match(
    checkJsonLd({
      site: "root",
      path: "/pt",
      loc: "https://raioviajante.com/pt",
      html: ld(document({ path: "/pt" }), person),
      sitemapLocs: [],
    }).join(),
    /Person must not state inLanguage/,
  );
});

test("structured data: a host-level entity states the shipped set, stable across pages", () => {
  const english = websiteJsonLd(DOCS, "docs", "d");
  assert.equal(english["@id"], `${DOCS}/#website`);
  assert.equal(english.inLanguage, "en", "English-only output is unchanged");
  const both = websiteJsonLd(DOCS, "docs", "d", { languages: ["en", "pt-BR"] });
  assert.deepEqual(both.inLanguage, ["en", "pt-BR"]);
  assert.equal(both["@id"], english["@id"]);
  assert.equal(
    websiteJsonLd(DOCS, "docs", "d", { languages: ["pt-BR"] }).inLanguage,
    "pt-BR",
  );
  const page = (path, node) => ({
    site: "docs",
    path,
    html: ld(document({ path }), node),
  });
  assert.deepEqual(
    checkEntityLanguages([
      page("/", both),
      page("/guide/", both),
      page("/pt/", both),
    ]),
    [],
  );
  assert.match(
    checkEntityLanguages([page("/", english), page("/pt/", both)]).join(),
    /states inLanguage \["en","pt-BR"\], but .* states \["en"\]/,
  );
  const invented = { ...english, inLanguage: "pt" };
  assert.match(
    jsonLd("/", "docs", ld(document({ path: "/" }), invented)),
    /WebSite inLanguage "pt" is not a registry value/,
  );
});

test("structured data: localized homes are not forced into one node layout", () => {
  assert.deepEqual(expectedTypes("docs", "/"), ["WebSite"]);
  assert.equal(expectedTypes("docs", "/pt/"), undefined);
  assert.deepEqual(expectedTypes("docs", "/pt/guide/"), [
    "TechArticle",
    "BreadcrumbList",
  ]);
  assert.equal(expectedTypes("docs", "/pt/search/"), undefined);
  assert.deepEqual(expectedTypes("dump", "/pt/posts/ola"), ["BlogPosting"]);
});

// ------------------------------------------- revision: close validation gaps

test("own locale and path agree whether or not the page has counterparts", () => {
  for (const counterparts of [undefined, []]) {
    for (const [locale, path] of [
      ["pt-BR", "/about"],
      ["en", "/pt/about"],
    ]) {
      const page = { locale, path, counterparts };
      assert.throws(() => alternateCluster(DUMP, page), RangeError, path);
      assert.throws(
        () =>
          pageMetadata(DUMP, "dump", { ...page, title: "t", description: "d" }),
        RangeError,
        path,
      );
    }
    // Untranslated but consistent pages stay valid and emit no cluster.
    assert.equal(
      alternateCluster(DUMP, { locale: "en", path: "/about", counterparts }),
      undefined,
    );
    assert.equal(
      alternateCluster(DUMP, {
        locale: "pt-BR",
        path: "/pt/about",
        counterparts,
      }),
      undefined,
    );
    const meta = pageMetadata(DUMP, "dump", {
      locale: "pt-BR",
      path: "/pt/about",
      counterparts,
      title: "t",
      description: "d",
    });
    assert.ok(!("languages" in meta.alternates));
  }
});

const webPage = (url, inLanguage) => ({
  "@type": "WebPage",
  "@id": url,
  ...(inLanguage ? { inLanguage } : {}),
});
const withPage = (locale, page, extra = {}) =>
  article(locale, { mainEntityOfPage: page, ...extra });

test("structured data: WebPage must state the rendered locale", () => {
  const url = `${DOCS}/guide/`;
  const run = (path, locale, page) =>
    jsonLd(
      path,
      "docs",
      ld(document({ path }), withPage(locale, page), crumbs),
    );
  assert.match(run("/guide/", "en", webPage(url)), /WebPage has no inLanguage/);
  assert.doesNotMatch(
    run("/guide/", "en", webPageRef(url, "en")),
    /WebPage|inLanguage/,
  );
  assert.doesNotMatch(
    run("/pt/guide/", "pt-BR", webPageRef(`${DOCS}/pt/guide/`, "pt-BR")),
    /WebPage|inLanguage/,
  );
  assert.match(
    run("/guide/", "en", webPage(url, "pt-BR")),
    /WebPage inLanguage is "pt-BR", expected "en"/,
  );
});

test("structured data: identity nodes are inspected wherever they nest", () => {
  const top = { ...personRef(), inLanguage: "en" };
  const nested = withPage("en", webPageRef(`${DOCS}/guide/`), {
    author: { ...personRef(), inLanguage: "en" },
  });
  assert.match(
    jsonLd("/guide/", "docs", ld(document({}), article("en"), crumbs, top)),
    /Person must not state inLanguage/,
  );
  assert.match(
    jsonLd("/guide/", "docs", ld(document({}), nested, crumbs)),
    /Person must not state inLanguage/,
  );
  const deep = article("en", {
    isPartOf: {
      "@id": `${DOCS}/#website`,
      about: [{ "@type": "Person", inLanguage: "en" }],
    },
  });
  assert.match(
    jsonLd("/guide/", "docs", ld(document({}), deep, crumbs)),
    /Person must not state inLanguage/,
  );
  // An @id-only reference states no language and is fine.
  const reference = article("en", { author: { "@id": personRef()["@id"] } });
  assert.doesNotMatch(
    jsonLd("/guide/", "docs", ld(document({}), reference, crumbs)),
    /inLanguage/,
  );
});

test("structured data: host language declarations match sitemap coverage", async () => {
  const { shippedLanguages } = await import("./structured-data.ts");
  assert.equal(shippedLanguages(), "en");
  assert.equal(websiteJsonLd(DOCS, "docs", "d").inLanguage, "en");
  assert.deepEqual(shippedLanguages(["en", "pt-BR"]), ["en", "pt-BR"]);
  // Contradictory sets for one @id still fail.
  const node = (languages) => websiteJsonLd(DOCS, "docs", "d", { languages });
  const page = (path, n) => ({
    site: "docs",
    path,
    html: ld(document({ path }), n),
  });
  assert.equal(
    checkEntityLanguages([
      page("/", node(["en", "pt-BR"])),
      page("/pt/", node(["en", "pt-BR"])),
    ]).join(),
    "",
  );
  assert.match(
    checkEntityLanguages([
      page("/", node(["en"])),
      page("/pt/", node(["en"])),
    ]).join(),
    /expected published sitemap languages \["en","pt-BR"\]/,
  );
  assert.match(
    checkEntityLanguages([
      page("/", node(["en"])),
      page("/guide/", node(["en", "pt-BR"])),
    ]).join(),
    /states inLanguage/,
  );
});

test("the shared 404 check always requires the rendered language", () => {
  const page = (lang) =>
    `<html${lang ? ` lang="${lang}"` : ""}><head><meta name="robots" content="noindex"/></head></html>`;
  const run = (locale, html) =>
    checkNotFoundPage("root", {
      path: "/x",
      status: 404,
      html,
      lang: locale,
    }).join();
  assert.equal(run("en", page("en")), "");
  assert.equal(run("pt-BR", page("pt-BR")), "");
  assert.match(
    run("en", page()),
    /404 <html lang> is undefined, expected "en"/,
  );
  assert.match(run("pt-BR", page()), /expected "pt-BR"/);
  assert.match(run("en", page("pt-BR")), /expected "en"/);
  // Omitting the expectation is a caller error, not a way to skip the check.
  assert.throws(() =>
    checkNotFoundPage("root", { path: "/x", status: 404, html: page("en") }),
  );
});

test("search pages: locale metadata and alternates are verified like any document", () => {
  const SEARCH = (site) => (site === "docs" ? "/search/" : "/search");
  const search = ({
    site = "docs",
    lang = "en",
    ogLocale = lang === "en" ? "en_US" : "pt_BR",
    robots = "noindex, follow",
    alternates = [],
    ogAlternates = [],
    path = lang === "en" ? SEARCH(site) : `/pt${SEARCH(site)}`,
  } = {}) => {
    const origin = site === "docs" ? DOCS : DUMP;
    return `<html lang="${lang}"><head><meta name="robots" content="${robots}"/><link rel="canonical" href="${origin}${path}"/><meta property="og:locale" content="${ogLocale}"/>${ogAlternates
      .map((a) => `<meta property="og:locale:alternate" content="${a}"/>`)
      .join("")}${alternates
      .map(
        ([h, href]) => `<link rel="alternate" hreflang="${h}" href="${href}"/>`,
      )
      .join("")}</head></html>`;
  };
  const run = (html, locale = "en", requested) =>
    checkSearchPage("docs", html, requested, locale).join("\n");
  const en = [
    ["en", `${DOCS}/search/`],
    ["pt-BR", `${DOCS}/pt/search/`],
    ["x-default", `${DOCS}/search/`],
  ];
  // Today: the English page alone.
  assert.equal(run(search()), "");
  assert.equal(run(search(), "en", "/search/?q=a&utm_source=x"), "");
  // A correct fixture pair.
  assert.equal(run(search({ alternates: en, ogAlternates: ["pt_BR"] })), "");
  assert.equal(
    run(
      search({ lang: "pt-BR", alternates: en, ogAlternates: ["en_US"] }),
      "pt-BR",
    ),
    "",
  );
  // Rules that must fail.
  assert.match(run(search({ ogLocale: "pt_BR" })), /og:locale is/);
  assert.match(
    run(
      search({
        alternates: [...en, ["en", `${DOCS}/search/`]],
        ogAlternates: ["pt_BR"],
      }),
    ),
    /duplicate hreflang "en"/,
  );
  assert.match(
    run(search({ alternates: en.slice(0, 2), ogAlternates: ["pt_BR"] })),
    /no x-default/,
  );
  assert.match(
    run(
      search({
        alternates: [en[0], en[1], ["x-default", `${DOCS}/pt/search/`]],
        ogAlternates: ["pt_BR"],
      }),
    ),
    /x-default .* is not the English member/,
  );
  assert.match(
    run(search({ alternates: en, ogAlternates: [] })),
    /og:locale:alternate is/,
  );
  assert.match(
    run(
      search({
        alternates: [en[0], ["pt-BR", `${DOCS}/search/`], en[2]],
        ogAlternates: ["pt_BR"],
      }),
    ),
    /which belongs to en/,
  );
  assert.match(
    run(
      search({
        alternates: [
          en[0],
          ["pt-BR", "https://raioviajante.com/pt/search/"],
          en[2],
        ],
        ogAlternates: ["pt_BR"],
      }),
    ),
    /pt-BR" .* is not on https:\/\/docs\.raioviajante\.com/,
  );
  assert.match(
    run(
      search({
        alternates: en,
        ogAlternates: ["pt_BR"],
        robots: "index, follow",
      }),
    ),
    /expected "noindex, follow"/,
  );
});

test("search pages join alternate reciprocity without joining the sitemap", () => {
  const html = (lang, path, alternates, ogAlternates) =>
    `<html lang="${lang}"><head><meta name="robots" content="noindex, follow"/><link rel="canonical" href="${DOCS}${path}"/>${ogAlternates}${alternates}</head></html>`;
  const cluster = (hrefs) =>
    hrefs
      .map(
        ([h, p]) =>
          `<link rel="alternate" hreflang="${h}" href="${DOCS}${p}"/>`,
      )
      .join("");
  const both = cluster([
    ["en", "/search/"],
    ["pt-BR", "/pt/search/"],
    ["x-default", "/search/"],
  ]);
  const enPage = {
    site: "docs",
    path: "/search/",
    html: html("en", "/search/", both, ""),
  };
  const ptPage = {
    site: "docs",
    path: "/pt/search/",
    html: html("pt-BR", "/pt/search/", both, ""),
  };
  assert.deepEqual(checkAlternateReciprocity([enPage, ptPage]), []);
  // The English page names a Portuguese search page that was never fetched.
  assert.match(
    checkAlternateReciprocity([enPage]).join(),
    /alternate .*\/pt\/search\/ is not a checked page/,
  );
  // A Portuguese page declaring another cluster is not reciprocal.
  const other = {
    ...ptPage,
    html: html("pt-BR", "/pt/search/", cluster([["pt-BR", "/pt/search/"]]), ""),
  };
  assert.match(
    checkAlternateReciprocity([enPage, other]).join(),
    /different cluster/,
  );
  // Search stays out of the sitemap whatever it declares.
  assert.ok(!isSearchPath("/guide/"));
  assert.ok(isSearchPath("/search/") && isSearchPath("/pt/search/"));
  const xml = sitemapResponse(DOCS, ["/", "/search/", "/pt/search/"]);
  return xml.text().then((text) => assert.ok(!text.includes("search")));
});

// ------------------------------------------ revision: Root Portuguese pages

test("uniqueness is per language: a page and its translation may share a brand title", () => {
  const page = (path, title) => ({
    site: "docs",
    path,
    html: `<html><head><title>${title}</title></head></html>`,
  });
  assert.deepEqual(
    checkUniqueness([page("/", "brand"), page("/pt/", "brand")]),
    [],
  );
  assert.match(
    checkUniqueness([page("/", "brand"), page("/guide/", "brand")]).join(),
    /duplicate title/,
  );
  assert.match(
    checkUniqueness([page("/pt/", "marca"), page("/pt/guia/", "marca")]).join(),
    /duplicate title/,
  );
});

test("hreflang is read whatever the attribute's case (React and Next emit hrefLang)", () => {
  const html = `<html lang="en"><head><link rel="alternate" hrefLang="pt-BR" href="https://docs.raioviajante.com/pt/"/></head></html>`;
  assert.equal(parseDocument(html).links[0].hreflang, "pt-BR");
});

test("a non-English 404 can carry its own title and description, still noindex with no canonical", () => {
  const meta = notFoundMetadata(DUMP, "root", "pt-BR", {
    title: "404 — não encontrada",
    description: "Esta página não foi encontrada.",
  });
  assert.equal(meta.title.absolute, "404 — não encontrada — root");
  assert.equal(meta.description, "Esta página não foi encontrada.");
  assert.deepEqual(meta.robots, { index: false });
  assert.deepEqual(meta.alternates, {});
  assert.equal(
    notFoundMetadata(DUMP, "dump").description,
    "This page could not be found on dump.raioviajante.com.",
  );
});
