import assert from "node:assert/strict";
import test from "node:test";
import {
  checkDocument,
  checkJsonLd,
  checkManifest,
  checkRobots,
  checkRss,
  checkSitemap,
  checkUniqueness,
  expectedTypes,
} from "./metadata-policy.ts";
import {
  identity,
  jsonLdScript,
  personRef,
  websiteJsonLd,
} from "./structured-data.ts";

// Fixtures: the smallest documents that satisfy the contract, then one break
// per rule. This proves the validator catches regressions; the real pages are
// checked by static-artifacts.test.mjs and verify-metadata.mjs.
const COLOR = "#191919";
const dumpPost = "https://dump.raioviajante.com/posts/foo";

function html({
  lang = "en",
  title = "Foo — dump",
  canonical = dumpPost,
  extraHead = "",
  ld,
  drop = [],
} = {}) {
  const parts = {
    title: `<title>${title}</title>`,
    description: `<meta name="description" content="About foo."/>`,
    canonical: `<link rel="canonical" href="${canonical}"/>`,
    ogtitle: `<meta property="og:title" content="${title}"/>`,
    ogdesc: `<meta property="og:description" content="About foo."/>`,
    ogurl: `<meta property="og:url" content="${canonical}"/>`,
    ogtype: `<meta property="og:type" content="article"/>`,
    ogimage: `<meta property="og:image" content="https://dump.raioviajante.com/og/posts/foo.png"/>`,
    published: `<meta property="article:published_time" content="2026-01-15T00:00:00.000Z"/>`,
    card: `<meta name="twitter:card" content="summary_large_image"/>`,
    twtitle: `<meta name="twitter:title" content="${title}"/>`,
    twdesc: `<meta name="twitter:description" content="About foo."/>`,
    twimage: `<meta name="twitter:image" content="https://dump.raioviajante.com/og/posts/foo.png"/>`,
    theme: `<meta name="theme-color" content="${COLOR}"/>`,
    icon: `<link rel="icon" href="/favicon.ico"/>`,
    apple: `<link rel="apple-touch-icon" href="/apple-icon.png"/>`,
    manifest: `<link rel="manifest" href="/manifest.webmanifest"/>`,
    rss: `<link rel="alternate" type="application/rss+xml" href="https://dump.raioviajante.com/rss.xml"/>`,
  };
  for (const key of drop) delete parts[key];
  return `<!doctype html><html lang="${lang}"><head>${Object.values(parts).join("")}${extraHead}${
    ld
      ? `<script type="application/ld+json">${jsonLdScript(...ld)}</script>`
      : ""
  }</head><body><h1>x</h1></body></html>`;
}
const doc = (overrides, path = "/posts/foo") =>
  checkDocument({
    site: "dump",
    path,
    loc: dumpPost,
    html: html(overrides),
    themeColor: COLOR,
  });

test("entities in titles are decoded before comparison", () => {
  const rssXml = rss([[dumpPost, "Thu, 15 Jan 2026 00:00:00 GMT"]]).replace(
    "<title>Foo</title>",
    "<title>I&apos;m &amp; you</title>",
  );
  assert.equal(
    checkRss("dump", rssXml, [dumpPost]).items[0].title,
    "I'm & you",
  );
});

test("a complete document passes", () => assert.deepEqual(doc(), []));

test("document rules each produce a located diagnostic", () => {
  const cases = [
    [{ lang: "pt" }, /app dump page \/posts\/foo: <html lang> is "pt"/],
    [{ drop: ["title"] }, /missing <title>/],
    [{ extraHead: "<title>Two</title>" }, /2 <title>/],
    [{ drop: ["description"] }, /missing meta description/],
    [{ drop: ["canonical"] }, /missing canonical link/],
    [
      { canonical: "https://foo.vercel.app/posts/foo" },
      /non-production host https:\/\/foo\.vercel\.app/,
    ],
    [{ canonical: "http://localhost:3001/posts/foo" }, /non-production host/],
    [
      { canonical: "https://dump.raioviajante.com/posts/other" },
      /differs from sitemap URL/,
    ],
    [{ canonical: `${dumpPost}?utm=x` }, /query or fragment/],
    [
      { extraHead: '<meta name="robots" content="noindex"/>' },
      /contradicts being in the sitemap/,
    ],
    [{ drop: ["ogimage"] }, /missing og:image/],
    [{ extraHead: '<meta property="og:title" content="dup"/>' }, /2 og:title/],
    [{ drop: ["card"] }, /missing twitter:card/],
    [{ drop: ["twimage"] }, /missing twitter:image/],
    [{ drop: ["theme"] }, /missing theme-color/],
    [
      { extraHead: '<meta name="theme-color" content="#fff"/>' },
      /2 theme-color/,
    ],
    [{ drop: ["apple"] }, /no apple-touch-icon/],
    [{ drop: ["rss"] }, /expected one RSS discovery link/],
    [{ drop: ["published"] }, /missing article:published_time/],
  ];
  for (const [overrides, pattern] of cases)
    assert.match(doc(overrides).join("\n"), pattern, JSON.stringify(overrides));
});

test("rel=me is required on the root and dump home pages only", () => {
  const withMe = (rel) =>
    html({
      canonical: "https://dump.raioviajante.com/",
      title: "dump",
      extraHead: "",
    }).replace("<body>", `<body><a href="${identity.github}"${rel}>`);
  const home = (h) =>
    checkDocument({
      site: "dump",
      path: "/",
      loc: "https://dump.raioviajante.com/",
      html: h,
      themeColor: COLOR,
    }).filter((m) => m.includes("rel="));
  assert.deepEqual(home(withMe(' rel="me"')), []);
  assert.match(home(withMe(""))[0], /lost rel="me"/);
});

test("duplicate titles and descriptions name both URLs and the value", () => {
  const page = (site, path, title) => ({ site, path, html: html({ title }) });
  const problems = checkUniqueness([
    page("dump", "/a", "Same"),
    page("docs", "/b/", "Same"),
    page("lab", "/c/", "Other"),
  ]);
  assert.match(
    problems.join("\n"),
    /duplicate title: https:\/\/dump\.raioviajante\.com\/a and https:\/\/docs\.raioviajante\.com\/b\/ => "Same"/,
  );
  assert.match(problems.join("\n"), /duplicate description/);
});

const sitemap = (urls) =>
  `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
    .map(
      ([loc, lastmod]) =>
        `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`,
    )
    .join("")}</urlset>`;

test("sitemap rules", () => {
  const ok = checkSitemap(
    "dump",
    sitemap([["https://dump.raioviajante.com/"], [dumpPost, "2026-01-15"]]),
  );
  assert.deepEqual(ok.problems, []);
  assert.equal(ok.entries.length, 2);
  const bad = (urls, site = "dump") =>
    checkSitemap(
      site,
      sitemap([["https://dump.raioviajante.com/"], ...urls]),
      new Date("2026-06-01"),
    ).problems.join("\n");
  assert.match(
    bad([["http://dump.raioviajante.com/x"]]),
    /is not on https:\/\/dump\.raioviajante\.com/,
  );
  assert.match(bad([["https://docs.raioviajante.com/x"]]), /is not on/);
  assert.match(bad([[dumpPost], [dumpPost]]), /duplicate/);
  assert.match(bad([[`${dumpPost}#top`]]), /query or fragment/);
  assert.match(bad([[`${dumpPost}?a=1`]]), /query or fragment/);
  assert.match(bad([["https://dump.raioviajante.com/404"]]), /is a 404 page/);
  assert.match(bad([[dumpPost, "2027-01-01"]]), /in the future/);
  assert.match(bad([[dumpPost, "soon"]]), /not a W3C date/);
  assert.match(
    bad([["https://dump.raioviajante.com/archive", "2026-01-01"]]),
    /has no content dates/,
  );
  assert.match(
    checkSitemap(
      "lab",
      sitemap([["https://lab.raioviajante.com/", "2026-01-01"]]),
    ).problems.join(),
    /has no content dates/,
  );
  assert.match(
    checkSitemap(
      "docs",
      sitemap([["https://docs.raioviajante.com/x/"]]),
    ).problems.join(),
    /home page is missing/,
  );
});

test("robots rules", () => {
  const good =
    "User-Agent: *\nAllow: /\nSitemap: https://docs.raioviajante.com/sitemap.xml\n";
  assert.deepEqual(checkRobots("docs", good, ["/", "/a/"]), []);
  const bad = (text) => checkRobots("docs", text, ["/", "/a/"]).join("\n");
  assert.match(bad(good.replace("docs.", "lab.")), /Sitemap line is/);
  assert.match(
    bad(good.replace("https://docs.raioviajante.com", "http://localhost:4321")),
    /local or preview host/,
  );
  assert.match(bad(good + "Disallow: /a\n"), /blocks sitemap page \/a\//);
  assert.match(
    bad("Allow: /\nSitemap: https://docs.raioviajante.com/sitemap.xml"),
    /no "User-agent: \*" group/,
  );
  assert.match(
    bad(
      "User-agent: *\nDisallow: /\nSitemap: https://docs.raioviajante.com/sitemap.xml",
    ),
    /indexing is not allowed/,
  );
});

test("manifest rules", () => {
  const manifest = (over = {}) =>
    JSON.stringify({
      name: "docs",
      start_url: "/",
      display: "browser",
      theme_color: COLOR,
      background_color: COLOR,
      icons: [{ src: "/icon.png" }],
      ...over,
    });
  assert.deepEqual(checkManifest("docs", manifest(), COLOR), []);
  assert.match(
    checkManifest("docs", manifest({ display: "standalone" }), COLOR).join(),
    /expected "browser"/,
  );
  assert.match(
    checkManifest("docs", manifest({ theme_color: "#000000" }), COLOR).join(),
    /theme_color is #000000/,
  );
  assert.match(checkManifest("docs", "nope", COLOR).join(), /not JSON/);
});

const rss = (items, origin = "https://dump.raioviajante.com") =>
  `<?xml version="1.0"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><link>${origin}</link><atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml" />${items
    .map(
      ([link, date]) =>
        `<item><title>Foo</title><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${date}</pubDate></item>`,
    )
    .join("")}</channel></rss>`;

test("rss rules", () => {
  const good = checkRss(
    "dump",
    rss([[dumpPost, "Thu, 15 Jan 2026 00:00:00 GMT"]]),
    [dumpPost],
  );
  assert.deepEqual(good.problems, []);
  const bad = (items, locs = [dumpPost]) =>
    checkRss("dump", rss(items), locs, new Date("2026-06-01")).problems.join(
      "\n",
    );
  assert.match(
    bad([["http://localhost:3001/posts/foo", "Thu, 15 Jan 2026 00:00:00 GMT"]]),
    /not a production post URL/,
  );
  assert.match(
    bad([[dumpPost, "Thu, 15 Jan 2026 00:00:00 GMT"]], []),
    /not in the sitemap/,
  );
  assert.match(bad([[dumpPost, "yesterday"]]), /not a date/);
  assert.match(
    bad([[dumpPost, "Thu, 15 Jan 2099 00:00:00 GMT"]]),
    /in the future/,
  );
});

// JSON-LD ---------------------------------------------------------------
const post = () => ({
  "@type": "BlogPosting",
  headline: "Foo",
  description: "About foo.",
  datePublished: "2026-01-15",
  url: dumpPost,
  mainEntityOfPage: { "@type": "WebPage", "@id": dumpPost },
  author: personRef(),
  inLanguage: "en",
  isPartOf: { "@id": "https://dump.raioviajante.com/#blog" },
  image: "https://dump.raioviajante.com/og/posts/foo.png",
});
const rssItems = [
  {
    title: "Foo",
    link: dumpPost,
    guid: dumpPost,
    pubDate: "Thu, 15 Jan 2026 00:00:00 GMT",
  },
];
const jsonLd = (nodes, over = {}) =>
  checkJsonLd({
    site: "dump",
    path: "/posts/foo",
    loc: dumpPost,
    html: html({ ld: nodes }),
    sitemapLocs: [dumpPost],
    rss: rssItems,
    ...over,
  });

test("a faithful BlogPosting passes", () =>
  assert.deepEqual(jsonLd([post()]), []));

test("BlogPosting rules", () => {
  const broken = (change, over) =>
    jsonLd([{ ...post(), ...change }], over).join("\n");
  assert.match(
    broken({ headline: "Bar" }),
    /headline "Bar" does not match the page title/,
  );
  assert.match(broken({ dateModified: "2026-02-01" }), /has dateModified/);
  assert.match(
    broken({ datePublished: "yesterday" }),
    /datePublished "yesterday" is not a date/,
  );
  assert.match(
    broken({ url: "https://dump.raioviajante.com/posts/other" }),
    /differ from canonical/,
  );
  assert.match(
    broken({ image: "https://dump.raioviajante.com/x.png" }),
    /image differs from og:image/,
  );
  assert.match(
    broken({ author: { ...personRef(), "@id": "https://example.com/#p" } }),
    /BlogPosting author is not the shared person/,
  );
  assert.match(broken({ publisher: personRef() }), /declares a publisher/);
  assert.match(
    broken({ isPartOf: { "@id": "https://dump.raioviajante.com/#x" } }),
    /not part of/,
  );
  assert.match(
    broken({
      url: "http://localhost:3001/posts/foo",
      mainEntityOfPage: { "@id": dumpPost },
    }),
    /not a production URL/,
  );
  assert.match(
    broken({}, { lastmod: "2026-03-03T00:00:00.000Z" }),
    /lastmod 2026-03-03.* does not match datePublished/,
  );
  assert.match(broken({}, { rss: [] }), /not in the RSS feed/);
  assert.match(
    broken(
      {},
      { rss: [{ ...rssItems[0], pubDate: "Fri, 16 Jan 2026 00:00:00 GMT" }] },
    ),
    /RSS pubDate/,
  );
  assert.match(
    jsonLd([]).join("\n"),
    /types are \[\], expected \[BlogPosting\]/,
  );
});

test("invalid blocks are reported", () => {
  const broken = checkJsonLd({
    site: "dump",
    path: "/posts/foo",
    loc: dumpPost,
    sitemapLocs: [dumpPost],
    html: html().replace(
      "</head>",
      '<script type="application/ld+json">{nope</script></head>',
    ),
  });
  assert.match(broken.join("\n"), /JSON-LD block 1 is not valid JSON/);
  const context = checkJsonLd({
    site: "dump",
    path: "/posts/foo",
    loc: dumpPost,
    sitemapLocs: [dumpPost],
    html: html().replace(
      "</head>",
      '<script type="application/ld+json">{"@context":"http://x","@graph":[]}</script></head>',
    ),
  });
  assert.match(context.join("\n"), /@context is "http:\/\/x"/);
});

const docsLoc = "https://docs.raioviajante.com/projects/sweep/cli/";
const article = () => ({
  "@type": "TechArticle",
  headline: "Sweep CLI",
  description: "About foo.",
  url: docsLoc,
  mainEntityOfPage: { "@type": "WebPage", "@id": docsLoc },
  inLanguage: "en",
  isPartOf: { "@id": "https://docs.raioviajante.com/#website" },
  image: "https://dump.raioviajante.com/og/posts/foo.png",
});
const crumbs = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, item], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item,
  })),
});
const docsLocs = [
  "https://docs.raioviajante.com/",
  "https://docs.raioviajante.com/projects/sweep/",
  docsLoc,
];
const docsCheck = (nodes, over = {}) =>
  checkJsonLd({
    site: "docs",
    path: "/projects/sweep/cli/",
    loc: docsLoc,
    sitemapLocs: docsLocs,
    html: html({
      title: "Sweep CLI — docs",
      canonical: docsLoc,
      ld: nodes,
    }).replace(
      /<meta property="og:image"[^>]*>/,
      '<meta property="og:image" content="https://dump.raioviajante.com/og/posts/foo.png"/>',
    ),
    ...over,
  });
const goodCrumbs = () =>
  crumbs([
    ["docs", docsLocs[0]],
    ["Sweep", docsLocs[1]],
    ["Sweep CLI", docsLoc],
  ]);

test("TechArticle and breadcrumbs", () => {
  assert.deepEqual(
    docsCheck([article(), goodCrumbs()]).filter((m) => !m.includes("image")),
    [],
  );
  const bad = (nodes, over) => docsCheck(nodes, over).join("\n");
  assert.match(
    bad([{ ...article(), author: personRef() }, goodCrumbs()]),
    /declares an author, which docs does not publish/,
  );
  assert.match(
    bad([{ ...article(), dateModified: "2026-10-06" }, goodCrumbs()]),
    /dateModified 2026-10-06 and sitemap lastmod undefined/,
  );
  assert.match(
    bad([article(), goodCrumbs()], { lastmod: "2026-10-06" }),
    /dateModified undefined and sitemap lastmod 2026-10-06/,
  );
  assert.equal(
    docsCheck([{ ...article(), dateModified: "2026-02-01" }, goodCrumbs()], {
      lastmod: "2026-02-01",
    }).filter((m) => m.includes("dateModified")).length,
    0,
    "an explicit lastUpdated is allowed",
  );
  assert.match(
    bad([
      article(),
      crumbs([
        ["docs", docsLocs[0]],
        ["Projects", "https://docs.raioviajante.com/projects/"],
        ["Sweep CLI", docsLoc],
      ]),
    ]),
    /not a page in the sitemap \(invented folder URL\?\)/,
  );
  const skipped = crumbs([
    ["docs", docsLocs[0]],
    ["Sweep CLI", docsLoc],
  ]);
  skipped.itemListElement[1].position = 3;
  assert.match(
    bad([article(), skipped]),
    /breadcrumb position 3 at index 1, expected 2/,
  );
  assert.match(
    bad([
      article(),
      crumbs([
        ["docs", docsLocs[0]],
        ["Sweep", docsLocs[1]],
      ]),
    ]),
    /last breadcrumb is not the current page/,
  );
  assert.match(
    bad([{ ...article(), headline: "Other" }, goodCrumbs()]),
    /TechArticle headline "Other"/,
  );
});

test("person identity and page classes", () => {
  const lab = (nodes) =>
    checkJsonLd({
      site: "lab",
      path: "/",
      loc: "https://lab.raioviajante.com/",
      sitemapLocs: [],
      html: html({ canonical: "https://lab.raioviajante.com/", ld: nodes }),
    });
  assert.match(
    lab([
      {
        ...websiteJsonLd("https://lab.raioviajante.com", "lab", "d"),
        author: personRef(),
      },
    ]).join("\n"),
    /declares an author, which lab does not publish/,
  );
  assert.match(
    lab([
      websiteJsonLd("https://lab.raioviajante.com", "lab", "d"),
      personJsonLdNode(),
    ]).join("\n"),
    /full Person node belongs only on the root home page/,
  );
  assert.deepEqual(expectedTypes("root", "/"), ["Person", "WebSite"]);
  assert.deepEqual(expectedTypes("dump", "/"), ["WebSite", "Blog"]);
  assert.deepEqual(expectedTypes("docs", "/"), ["WebSite"]);
  assert.deepEqual(expectedTypes("lab", "/"), ["WebSite"]);
  for (const [site, path] of [
    ["root", "/about"],
    ["dump", "/archive"],
    ["docs", "/search/"],
    ["lab", "/experiments/x/"],
  ])
    assert.equal(expectedTypes(site, path), undefined, `${site} ${path}`);
});
function personJsonLdNode() {
  return { ...personRef(), sameAs: [identity.github] };
}
