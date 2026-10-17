import { fileURLToPath } from "node:url";
import {
  checkDocument,
  checkJsonLd,
  checkManifest,
  checkRobots,
  checkRss,
  checkSearchPage,
  checkSitemap,
  searchPaths,
  searchPathFor,
} from "./metadata-policy.ts";
import { DEFAULT_LOCALE, LOCALE_IDS, localeOfPath } from "../site/locales.ts";
import { siteOrigins } from "../site/sites.ts";

// Glue shared by the build-output test and the HTTP verifier: given the
// documents of one app, run every rule. The page inventory is always the app's
// own sitemap; there is no second list of routes.

/** The expected theme color, from the design token the apps already read. */
export async function expectedThemeColor() {
  const { themeColor } = await import("../packages/design/theme-color.ts");
  const previous = process.cwd();
  // theme-color.ts resolves tokens.css relative to an app directory, like the builds.
  process.chdir(fileURLToPath(new URL("../apps/root/", import.meta.url)));
  try {
    return await themeColor();
  } finally {
    process.chdir(previous);
  }
}

/**
 * @param {object} input
 * @param {import("../site/sites.ts").SiteId} input.site
 * @param {{ sitemap: string, robots: string, manifest: string, rss?: string }} input.files
 * @param {((path: string) => Promise<string | undefined>) | undefined} input.html
 *   Returns a document's HTML, or undefined when it cannot be read here.
 */
export async function auditSite({
  site,
  files,
  html,
  themeColor,
  now = new Date(),
}) {
  const problems = [];
  const sitemap = checkSitemap(site, files.sitemap, now);
  problems.push(...sitemap.problems);
  const locs = sitemap.entries.map((e) => e.loc);
  const paths = locs.map((loc) => new URL(loc).pathname);
  // The search page is not indexed and not in the sitemap, but must stay
  // crawlable: robots.txt may not block it (or crawlers could not see noindex).
  const search = searchPaths[site];
  for (const locale of LOCALE_IDS)
    if (paths.includes(searchPathFor(site, locale)))
      problems.push(
        `app ${site} sitemap: lists ${searchPathFor(site, locale)}, which is noindex`,
      );
  problems.push(...checkRobots(site, files.robots, [...paths, search]));
  problems.push(...checkManifest(site, files.manifest, themeColor));
  let rssItems;
  if (site === "dump") {
    const rss = checkRss(site, files.rss ?? "", locs, now);
    problems.push(...rss.problems);
    rssItems = rss.items;
  }
  const pages = [];
  if (html)
    for (const entry of sitemap.entries) {
      const path = new URL(entry.loc).pathname;
      const document = await html(path);
      if (document === undefined) {
        problems.push(`app ${site} page ${path}: document could not be read`);
        continue;
      }
      pages.push({ site, path, html: document });
      const context = { site, path, loc: entry.loc, html: document };
      problems.push(
        ...checkDocument({ ...context, themeColor }),
        ...checkJsonLd({
          ...context,
          lastmod: entry.lastmod,
          sitemapLocs: locs,
          rss: rssItems,
        }),
      );
    }
  // Real search documents are not sitemap pages but do join alternate
  // reciprocity. A localized search page is added here once its app ships it.
  const searchPages = [];
  if (html) {
    // The English search page always; another locale's only once the app
    // publishes pages in it (its sitemap lists them), which is how a published
    // but not yet advertised locale joins the checks.
    const published = new Set(paths.map((path) => localeOfPath(path)));
    for (const locale of LOCALE_IDS) {
      if (locale !== DEFAULT_LOCALE && !published.has(locale)) continue;
      const where = searchPathFor(site, locale);
      const document = await html(where);
      if (document === undefined)
        problems.push(`app ${site} page ${where}: document could not be read`);
      else {
        problems.push(...checkSearchPage(site, document, where, locale));
        searchPages.push({ site, path: where, html: document });
      }
    }
  }
  return {
    problems,
    pages,
    searchPages,
    alternatePages: [...pages, ...searchPages],
    entries: sitemap.entries,
    rssItems,
  };
}

export { siteOrigins };
