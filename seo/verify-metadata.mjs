import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { siteOrigins } from "../site/sites.ts";
import { checkSecurityTxt, securityTxtPath } from "../security/security-txt.ts";
import { renderLlmsTxt } from "./llms.ts";
import { checkEnglishIndexLocale, checkIndexLocale } from "./search-index.ts";
import {
  DEFAULT_LOCALE,
  LOCALE_IDS,
  localeOfPath,
  localizedPath,
} from "../site/locales.ts";
import { ports, startServers } from "../security/local-servers.mjs";
import { auditSite, expectedThemeColor } from "./audit.mjs";
import {
  checkBaselineSearchIndex,
  checkBaselineSearchIndexType,
  checkBaselineSitemap,
} from "./english-baseline.ts";
import {
  checkAlternateReciprocity,
  checkEntityLanguages,
  checkNotFoundPage,
  checkSearchPage,
  checkUniqueness,
  parseDocument,
  searchPathFor,
} from "./metadata-policy.ts";

// Runtime SEO verification of the four built apps over local HTTP. Every
// document comes from the app's own sitemap, so this covers the dynamically
// rendered Root and Dump pages that build output alone cannot. Run
// `pnpm seo:verify` after `pnpm -r build` (NEXT_PUBLIC_SITE_URL=
// https://dump.raioviajante.com). Not part of `pnpm validate`: it needs local
// sockets. Exit codes: 0 pass, 1 contract violation, 2 apps could not start.
const sites = Object.keys(ports);
const baseline = JSON.parse(
  await readFile(new URL("./english-baseline.json", import.meta.url), "utf8"),
);
const local = (site, path) => `http://127.0.0.1:${ports[site]}${path}`;
const localFor = (url) => {
  const { origin, pathname, search } = new URL(url);
  const site = sites.find((s) => siteOrigins[s] === origin);
  return site ? local(site, pathname + search) : undefined;
};
const problems = [];
const fail = (message) => problems.push(message);

const { stop } = await startServers();
process.on("exit", stop);
const themeColor = await expectedThemeColor();

const get = async (site, path, init) => {
  const response = await fetch(local(site, path), {
    redirect: "manual",
    ...init,
  });
  return {
    response,
    text: response.headers.get("content-type")?.match(/text|json|xml/)
      ? await response.text()
      : (await response.arrayBuffer(), ""),
  };
};
async function text(site, path, contentType) {
  const { response, text } = await get(site, path);
  if (response.status !== 200)
    fail(`app ${site} ${path}: HTTP ${response.status}`);
  const type = response.headers.get("content-type") ?? "";
  if (!contentType.test(type))
    fail(
      `app ${site} ${path}: content type ${JSON.stringify(type)} does not match ${contentType}`,
    );
  return text;
}

const allPages = [];
const alternatePages = [];
const images = new Map();
const assets = new Map();
const discoveryLinks = new Set();
let documents = 0;
for (const site of sites) {
  const security = await text(site, securityTxtPath, /^text\/plain\b/);
  problems.push(
    ...checkSecurityTxt(site, security).map(
      (p) => `app ${site} security.txt: ${p}`,
    ),
  );
  // Astro preview serves emitted .txt files without a charset; Next keeps it.
  const plainText =
    site === "docs" || site === "lab"
      ? /^text\/plain(?:;\s*charset=utf-8)?$/i
      : /^text\/plain;\s*charset=utf-8$/i;
  const llms = await text(site, "/llms.txt", plainText);
  if (llms !== renderLlmsTxt(site))
    fail(`app ${site} llms.txt: does not match the curated discovery index`);
  for (const match of llms.matchAll(/\]\(([^)]+)\)/g))
    discoveryLinks.add(match[1]);
  const files = {
    sitemap: await text(site, "/sitemap.xml", /xml/),
    robots: await text(site, "/robots.txt", /^text\/plain/),
    manifest: await text(site, "/manifest.webmanifest", /manifest\+json|json/),
    rss:
      site === "dump"
        ? await text(site, "/rss.xml", /^application\/rss\+xml/)
        : undefined,
  };
  const result = await auditSite({
    site,
    files,
    themeColor,
    html: async (path) => {
      const { response, text } = await get(site, path);
      if (response.status !== 200) {
        fail(`app ${site} page ${path}: HTTP ${response.status}`);
        return undefined;
      }
      if (!/^text\/html/.test(response.headers.get("content-type") ?? ""))
        fail(`app ${site} page ${path}: not served as HTML`);
      return text;
    },
  });
  problems.push(...result.problems);
  // The English baseline (seo/english-baseline.json): nothing recorded may
  // disappear. Additions, including localized pages, are not a problem.
  const recorded = baseline[site];
  problems.push(
    ...checkBaselineSitemap(
      site,
      recorded,
      result.entries.map((e) => e.loc),
    ),
  );
  for (const path of recorded.endpoints) {
    const { response } = await get(site, path);
    if (response.status !== 200)
      fail(
        `app ${site} ${path}: English baseline endpoint answered HTTP ${response.status}`,
      );
  }
  const index = await get(site, recorded.searchIndex.path);
  problems.push(
    ...checkBaselineSearchIndexType(
      site,
      recorded,
      index.response.headers.get("content-type"),
    ),
  );
  const indexEntries = index.text ? JSON.parse(index.text) : undefined;
  problems.push(
    ...checkBaselineSearchIndex(site, recorded, indexEntries),
    // Producer migration (#42): every English entry states locale "en".
    ...checkEnglishIndexLocale(site, recorded.searchIndex.path, indexEntries),
  );
  allPages.push(...result.pages);
  alternatePages.push(...result.alternatePages);
  documents += result.pages.length;

  for (const page of result.pages) {
    const doc = parseDocument(page.html);
    for (const key of ["og:image", "twitter:image"]) {
      const url = doc.meta.get(key)?.[0];
      if (url) images.set(url, `app ${site} page ${page.path}`);
    }
    for (const link of doc.links)
      if (
        /^(icon|apple-touch-icon|manifest)$/.test(link.rel) ||
        link.rel.includes("icon")
      )
        assets.set(`${site} ${link.href}`, {
          site,
          href: link.href,
          rel: link.rel,
        });
  }
  for (const icon of JSON.parse(files.manifest || "{}").icons ?? [])
    assets.set(`${site} ${icon.src}`, {
      site,
      href: icon.src,
      rel: "manifest icon",
    });

  // Search: not in the sitemap (audited above), but explicitly visited: 200,
  // noindex/follow and one bare canonical, whatever the query string.
  // Every locale the app publishes pages in (its sitemap says which) has its
  // own search page and index; English always does.
  const published = [
    DEFAULT_LOCALE,
    ...LOCALE_IDS.filter(
      (locale) =>
        locale !== DEFAULT_LOCALE &&
        result.entries.some(
          (e) => localeOfPath(new URL(e.loc).pathname) === locale,
        ),
    ),
  ];
  for (const locale of published) {
    const search = searchPathFor(site, locale);
    for (const query of [
      "",
      "?q=seo%20check",
      "?q=a&utm_source=x&utm_campaign=y",
    ]) {
      const { response, text: searched } = await get(site, search + query);
      if (response.status !== 200)
        fail(`app ${site} ${search}${query}: HTTP ${response.status}`);
      problems.push(...checkSearchPage(site, searched, search + query, locale));
    }
    // Another locale's index: JSON, a valid array, every entry that locale's.
    if (locale !== DEFAULT_LOCALE) {
      const indexPath = localizedPath(site, locale, "/search-index.json");
      const published_ = await get(site, indexPath);
      if (published_.response.status !== 200)
        fail(`app ${site} ${indexPath}: HTTP ${published_.response.status}`);
      if (
        !/^application\/json\b/.test(
          published_.response.headers.get("content-type") ?? "",
        )
      )
        fail(`app ${site} ${indexPath}: not served as application/json`);
      problems.push(
        ...checkIndexLocale(
          site,
          indexPath,
          published_.text ? JSON.parse(published_.text) : undefined,
          locale,
        ),
      );
    }
  }

  // Missing routes: 404, noindex, no canonical, no hreflang, not in the
  // sitemap, and `lang` equal to the copy rendered (English for every miss
  // today; the Portuguese miss checks arrive with the apps that serve them).
  const sitemapPaths = result.entries.map((e) => new URL(e.loc).pathname);
  if (site === "root" || site === "dump")
    for (const { path, lang } of [
      ...(site === "dump"
        ? ["/seo-missing-check", "/posts/seo-missing-check"]
        : ["/seo-missing-check"]
      ).map((path) => ({
        path,
        lang: DEFAULT_LOCALE,
      })),
      // A published locale answers its own misses in its own language.
      ...published
        .filter((locale) => locale !== DEFAULT_LOCALE)
        .map((locale) => ({
          path: localizedPath(site, locale, "/seo-missing-check"),
          lang: locale,
        })),
    ]) {
      const { response, text: body } = await get(site, path);
      // TEMPORARY LEGACY EXCEPTION, this one call site only. A missing dump
      // post is answered with Next's generic error document, which has no
      // `<html lang>`. That predates the multilingual work and is owned by the
      // later Dump routing/404 slice, which removes this exemption. Only the
      // absence of `lang` is tolerated here; a wrong `lang` still fails, and
      // `checkNotFoundPage` itself always requires the language.
      const legacyDumpMiss =
        site === "dump" &&
        path === "/posts/seo-missing-check" &&
        parseDocument(body).lang === undefined;
      problems.push(
        ...checkNotFoundPage(site, {
          path,
          status: response.status,
          html: body,
          lang,
          sitemapPaths,
        }).filter((p) => !(legacyDumpMiss && p.includes("404 <html lang>"))),
      );
    }
  else {
    // Astro preview does not serve 404.html for unknown paths, so read the
    // built page; Vercel serves it with status 404.
    const built = await readFile(
      new URL(`../apps/${site}/dist/404.html`, import.meta.url),
      "utf8",
    ).catch(() => "");
    problems.push(
      ...checkNotFoundPage(site, {
        path: "/404.html",
        status: built ? 404 : 0,
        html: built,
        lang: "en",
        sitemapPaths,
      }),
    );
  }
}

// Alternates must be real, public and reciprocal across the whole app, and a
// host-level entity never states contradictory languages.
for (const site of sites) {
  const pages = allPages.filter((page) => page.site === site);
  problems.push(
    ...checkAlternateReciprocity(
      alternatePages.filter((page) => page.site === site),
    ),
    ...checkEntityLanguages(pages),
  );
}

problems.push(...checkUniqueness(allPages));

const publicUrls = new Set(
  allPages.map(({ site, path }) => new URL(path, siteOrigins[site]).href),
);
publicUrls.add(`${siteOrigins.dump}/rss.xml`);
for (const url of discoveryLinks)
  if (!publicUrls.has(url))
    fail(`llms.txt: ${url} is not a verified public sitemap page or feed`);

for (const [url, where] of images) {
  const target = localFor(url);
  if (!target) {
    fail(`${where}: social image ${url} is not on a RaioViajante host`);
    continue;
  }
  const response = await fetch(target);
  const type = response.headers.get("content-type") ?? "";
  if (response.status !== 200 || !/^image\//.test(type))
    fail(
      `${where}: social image ${url} answered HTTP ${response.status} ${type}`,
    );
  await response.arrayBuffer();
}
for (const { site, href, rel } of assets.values()) {
  const response = await fetch(new URL(href, local(site, "/")));
  const type = response.headers.get("content-type") ?? "";
  const wanted = rel === "manifest" ? /json/ : /^image\//;
  if (response.status !== 200 || !wanted.test(type))
    fail(
      `app ${site}: ${rel} ${href} answered HTTP ${response.status} ${type}`,
    );
  await response.arrayBuffer();
}

stop();
const unique = (a) => [...new Set(a)];
console.log(
  `${documents} sitemap documents (${sites.map((s) => `${s} ${allPages.filter((p) => p.site === s).length}`).join(", ")}), ${images.size} social images, ${assets.size} icon/manifest URLs checked.`,
);
if (problems.length) {
  console.error(
    `\nFAILED (${problems.length}):\n${unique(problems)
      .map((p) => `  - ${p}`)
      .join("\n")}`,
  );
  process.exitCode = 1;
} else console.log("SEO contract holds.");
