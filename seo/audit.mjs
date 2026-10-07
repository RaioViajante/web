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
} from "./metadata-policy.ts";
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
  if (paths.includes(search))
    problems.push(`app ${site} sitemap: lists ${search}, which is noindex`);
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
  if (html) {
    const document = await html(search);
    if (document === undefined)
      problems.push(`app ${site} page ${search}: document could not be read`);
    else problems.push(...checkSearchPage(site, document));
  }
  return { problems, pages, entries: sitemap.entries, rssItems };
}

export { siteOrigins };
