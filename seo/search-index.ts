import {
  DEFAULT_LOCALE,
  localeOfPath,
  stripLocalePrefix,
  type LocaleId,
} from "../site/locales.ts";
import { siteOrigins, type SiteId as Site } from "../site/sites.ts";
import type { Problems } from "./metadata-policy.ts";

// The producer side of the English search schema migration (docs/i18n.md,
// "Search"): every entry of a host's `/search-index.json` carries the internal
// locale id `en`. This checks producers only. Readers still accept an entry
// without `locale` until all four production indexes have shipped it.

/**
 * Every entry of a locale's index states that locale's id, exactly, belongs to
 * the host, and links to a page of that locale (`/pt/…` for Portuguese, an
 * unprefixed path for English).
 */
export function checkIndexLocale(
  site: Site,
  path: string,
  entries: unknown,
  locale: LocaleId,
  publishedPaths: readonly string[],
  publishedSearchablePaths: readonly string[],
): Problems {
  const at = `app ${site} ${path}`;
  if (!Array.isArray(entries)) return [`${at}: not a JSON array`];
  const problems: Problems = [];
  if (entries.length === 0 && publishedSearchablePaths.length > 0)
    problems.push(
      `${at}: empty index despite ${publishedSearchablePaths.length} published searchable destination${publishedSearchablePaths.length === 1 ? "" : "s"}`,
    );
  const wrong = new Map<string, number>();
  let strangers = 0;
  let elsewhere = 0;
  let unpublished = 0;
  const inventory = new Set(publishedPaths);
  const duplicates = new Map<string, number>();
  const duplicateContentIds = new Map<string, number>();
  const required = ["site", "locale", "title", "href", "description"] as const;
  const optional = ["number", "date", "body"] as const;
  for (const [index, entry] of entries.entries()) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      problems.push(`${at}: entry ${index + 1} is not an object`);
      continue;
    }
    const record = entry as Record<string, unknown>;
    for (const field of required)
      if (typeof record[field] !== "string")
        problems.push(
          `${at}: entry ${index + 1} field "${field}" is not a string`,
        );
    for (const field of optional)
      if (record[field] !== undefined && typeof record[field] !== "string")
        problems.push(
          `${at}: entry ${index + 1} field "${field}" is not a string`,
        );
    let isDumpWorkEntry = false;
    if (typeof record.href === "string")
      try {
        const url = new URL(record.href);
        isDumpWorkEntry =
          site === "dump" &&
          !url.hash &&
          stripLocalePrefix(url.pathname).startsWith("/posts/");
      } catch {
        // URL diagnostics are emitted below; do not duplicate them here.
      }
    if (record.contentId !== undefined || isDumpWorkEntry) {
      if (
        typeof record.contentId !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.contentId)
      )
        problems.push(
          `${at}: entry ${index + 1} field "contentId" is not a valid stable id`,
        );
      else if (isDumpWorkEntry)
        duplicateContentIds.set(
          record.contentId,
          (duplicateContentIds.get(record.contentId) ?? 0) + 1,
        );
    }
    for (const field of ["title", "href", "description"] as const)
      if (typeof record[field] === "string" && !record[field].trim())
        problems.push(`${at}: entry ${index + 1} field "${field}" is empty`);

    const found = record.locale;
    if (found !== locale) {
      const key = JSON.stringify(found) ?? "missing";
      wrong.set(key, (wrong.get(key) ?? 0) + 1);
    }
    if (record.site !== site) strangers++;
    try {
      if (typeof record.href !== "string") throw new TypeError("invalid href");
      const url = new URL(record.href);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.search ||
        url.origin !== siteOrigins[site] ||
        localeOfPath(url.pathname) !== locale
      )
        elsewhere++;
      else if (!inventory.has(url.pathname)) unpublished++;
    } catch {
      elsewhere++;
    }

    const duplicateKey = JSON.stringify(
      [...required, ...optional, "contentId"].map(
        (field) => record[field] ?? null,
      ),
    );
    duplicates.set(duplicateKey, (duplicates.get(duplicateKey) ?? 0) + 1);
  }
  for (const [value, count] of wrong)
    problems.push(
      `${at}: ${count} entries have locale ${value}, expected "${locale}"`,
    );
  if (strangers)
    problems.push(`${at}: ${strangers} entries are not site "${site}"`);
  if (elsewhere)
    problems.push(
      `${at}: ${elsewhere} entries do not link to a ${locale} page on ${siteOrigins[site]}`,
    );
  if (unpublished)
    problems.push(
      `${at}: ${unpublished} entries link to destinations absent from the published sitemap inventory`,
    );
  const duplicateCount = [...duplicates.values()].reduce(
    (count, occurrences) => count + Math.max(occurrences - 1, 0),
    0,
  );
  if (duplicateCount)
    problems.push(`${at}: ${duplicateCount} duplicate entries`);
  const duplicateWorks = [...duplicateContentIds.values()].reduce(
    (count, occurrences) => count + Math.max(occurrences - 1, 0),
    0,
  );
  if (duplicateWorks)
    problems.push(`${at}: ${duplicateWorks} duplicate content ids`);
  return problems;
}

/** Every entry of the English index states the English locale id, exactly. */
export function checkEnglishIndexLocale(
  site: Site,
  path: string,
  entries: unknown,
  publishedPaths: readonly string[],
  publishedSearchablePaths: readonly string[],
): Problems {
  return checkIndexLocale(
    site,
    path,
    entries,
    DEFAULT_LOCALE,
    publishedPaths,
    publishedSearchablePaths,
  );
}
