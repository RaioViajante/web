import {
  isLocaleId,
  localeById,
  localizedPath,
  participates,
  trailingSlash,
  type LocaleId,
} from "../../../site/locales";
import type { SiteId } from "../../../site/sites";
import type { SearchEntry } from "../components/search";

// The locale rules of shared search, in one place (docs/i18n.md, "Search").
// Everything here is a pure function of a site and a locale. The rendered
// route states the locale; nothing is inferred from the browser, and nothing
// is stored. Supporting a Portuguese path here does not publish it.

/** Where a host serves its search page in a locale (`/search`, `/pt/search/`). */
export function searchPagePath(site: SiteId, locale: LocaleId) {
  return localizedPath(
    site,
    locale,
    trailingSlash[site] === "always" ? "/search/" : "/search",
  );
}

/** Where a host serves its search index in a locale. */
export function searchIndexPath(site: SiteId, locale: LocaleId) {
  return localizedPath(site, locale, "/search-index.json");
}

/**
 * The one text rule of the shared engine, for indexed text and queries alike:
 * lower-case with the locale's `Intl` locale, decompose, and drop combining
 * marks. Matching is accent-insensitive in every locale ("configuração"
 * matches "configuracao", "café" matches "cafe"). No other transliteration.
 */
export function normalizeSearchText(text: string, locale: LocaleId) {
  return text
    .toLocaleLowerCase(localeById(locale).intlLocale)
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** `YYYY-MM-DD` as the same calendar date in the locale's format, in every timezone. */
export function formatSearchDate(date: string, locale: LocaleId) {
  if (!/^\d{4}-\d\d-\d\d$/.test(date)) return date;
  const value = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat(localeById(locale).intlLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(value);
}

/**
 * The search page to move to when deliberately changing language: only `q`
 * travels, and only when the host participates in both locales. Returns
 * undefined otherwise, so no unavailable action is advertised.
 */
export function searchLocaleHref(
  site: SiteId,
  from: LocaleId,
  to: LocaleId,
  query: string,
  isParticipating: (site: SiteId, locale: LocaleId) => boolean = participates,
) {
  if (!isParticipating(site, from) || !isParticipating(site, to))
    return undefined;
  const q = query.trim();
  const path = searchPagePath(site, to);
  return q ? `${path}?${new URLSearchParams({ q })}` : path;
}

/**
 * A fetched index, checked against the requested site and locale. One wrong
 * entry invalidates the response: it is never filtered. An empty array is a
 * valid index.
 */
export function validateIndex(
  data: unknown,
  site: SiteId,
  locale: LocaleId,
): SearchEntry[] {
  if (!Array.isArray(data)) throw new Error(`Unexpected search index: ${site}`);
  for (const entry of data) {
    if (entry?.site !== site)
      throw new Error(`Unexpected search index site: ${site}`);
    if (!isLocaleId(entry.locale) || entry.locale !== locale)
      throw new Error(`Unexpected search index locale: ${site} ${locale}`);
  }
  return data as SearchEntry[];
}
