import {
  DEFAULT_LOCALE,
  localeOfPath,
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
): Problems {
  const at = `app ${site} ${path}`;
  if (!Array.isArray(entries)) return [`${at}: not a JSON array`];
  if (entries.length === 0) return [`${at}: no entries`];
  const problems: Problems = [];
  const wrong = new Map<string, number>();
  let strangers = 0;
  let elsewhere = 0;
  for (const entry of entries) {
    const found = (entry as { locale?: unknown } | null)?.locale;
    if (found !== locale) {
      const key = JSON.stringify(found) ?? "missing";
      wrong.set(key, (wrong.get(key) ?? 0) + 1);
    }
    if ((entry as { site?: unknown } | null)?.site !== site) strangers++;
    try {
      const url = new URL(String((entry as { href?: unknown })?.href));
      if (
        url.origin !== siteOrigins[site] ||
        localeOfPath(url.pathname) !== locale
      )
        elsewhere++;
    } catch {
      elsewhere++;
    }
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
  return problems;
}

/** Every entry of the English index states the English locale id, exactly. */
export function checkEnglishIndexLocale(
  site: Site,
  path: string,
  entries: unknown,
): Problems {
  return checkIndexLocale(site, path, entries, DEFAULT_LOCALE);
}
