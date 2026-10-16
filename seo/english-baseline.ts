import { siteOrigins, type SiteId as Site } from "../site/sites.ts";
import type { Problems } from "./metadata-policy.ts";

// The English public contract as it stood before the multilingual work, kept in
// `english-baseline.json` and checked by `pnpm seo:verify` (all four hosts, over
// HTTP) and by `seo/english-baseline.test.mjs` (Docs and Lab build output). It
// is a floor, not a snapshot: every recorded sitemap page, endpoint and search
// page must still be there, and new English or Portuguese entries are welcome.
// A deliberate English removal updates the baseline in the same change.
// RSS item identity is captured separately, by the Dump identity work.
// Regenerate with `pnpm seo:baseline` (after `pnpm -r build`).

export interface SiteBaseline {
  /** Sitemap pathnames, sorted. */
  sitemap: string[];
  /** Discovery endpoints that must answer 200, sorted. */
  endpoints: string[];
  searchIndex: {
    path: string;
    /** Fields every entry of the index carries today. */
    fields: string[];
    /** Page pathnames (no fragments) the index lists, sorted. */
    pages: string[];
  };
}

export type EnglishBaseline = Record<Site, SiteBaseline>;

export interface IndexEntry {
  href?: unknown;
  [field: string]: unknown;
}

const missing = (recorded: string[], current: Iterable<string>) => {
  const have = new Set(current);
  return recorded.filter((item) => !have.has(item));
};

export function pageOf(href: string, site: Site): string | undefined {
  try {
    const url = new URL(href);
    return url.origin === siteOrigins[site] ? url.pathname : undefined;
  } catch {
    return undefined;
  }
}

/** Recorded sitemap pages that the current sitemap no longer lists. */
export function checkBaselineSitemap(
  site: Site,
  baseline: SiteBaseline,
  locs: string[],
): Problems {
  const paths = locs.map((loc) => new URL(loc).pathname);
  return missing(baseline.sitemap, paths).map(
    (path) => `app ${site} sitemap: English baseline page ${path} is missing`,
  );
}

/** The search index must keep its fields and every recorded English page. */
export function checkBaselineSearchIndex(
  site: Site,
  baseline: SiteBaseline,
  entries: unknown,
): Problems {
  const at = `app ${site} ${baseline.searchIndex.path}`;
  if (!Array.isArray(entries)) return [`${at}: not a JSON array`];
  const p: Problems = [];
  for (const field of baseline.searchIndex.fields) {
    const without = entries.filter(
      (entry: IndexEntry) => !entry || !(field in entry),
    ).length;
    if (without) p.push(`${at}: ${without} entries lack "${field}"`);
  }
  const pages = entries.flatMap((entry: IndexEntry) =>
    typeof entry?.href === "string" ? [pageOf(entry.href, site) ?? ""] : [],
  );
  for (const path of missing(baseline.searchIndex.pages, pages))
    p.push(`${at}: English baseline page ${path} is missing`);
  return p;
}

/** What a baseline would record for the current output (used by the generator). */
export function describeBaseline(
  site: Site,
  input: {
    sitemapLocs: string[];
    endpoints: string[];
    searchPath: string;
    searchEntries: IndexEntry[];
  },
): SiteBaseline {
  const sorted = (items: Iterable<string>) => [...new Set(items)].sort();
  const fields = input.searchEntries.map((entry) => Object.keys(entry));
  return {
    sitemap: sorted(input.sitemapLocs.map((loc) => new URL(loc).pathname)),
    endpoints: sorted(input.endpoints),
    searchIndex: {
      path: input.searchPath,
      fields: sorted(
        fields[0]?.filter((k) => fields.every((f) => f.includes(k))) ?? [],
      ),
      pages: sorted(
        input.searchEntries.flatMap((entry) =>
          typeof entry.href === "string"
            ? [pageOf(entry.href, site) ?? ""]
            : [],
        ),
      ),
    },
  };
}
