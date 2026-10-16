import { DEFAULT_LOCALE } from "../site/locales.ts";
import type { SiteId as Site } from "../site/sites.ts";
import type { Problems } from "./metadata-policy.ts";

// The producer side of the English search schema migration (docs/i18n.md,
// "Search"): every entry of a host's `/search-index.json` carries the internal
// locale id `en`. This checks producers only. Readers still accept an entry
// without `locale` until all four production indexes have shipped it.

/** Every entry of the English index states the English locale id, exactly. */
export function checkEnglishIndexLocale(
  site: Site,
  path: string,
  entries: unknown,
): Problems {
  const at = `app ${site} ${path}`;
  if (!Array.isArray(entries)) return [`${at}: not a JSON array`];
  if (entries.length === 0) return [`${at}: no entries`];
  const problems: Problems = [];
  const wrong = new Map<string, number>();
  for (const entry of entries) {
    const locale = (entry as { locale?: unknown } | null)?.locale;
    if (locale !== DEFAULT_LOCALE) {
      const key = JSON.stringify(locale) ?? "missing";
      wrong.set(key, (wrong.get(key) ?? 0) + 1);
    }
  }
  for (const [value, count] of wrong)
    problems.push(
      `${at}: ${count} entries have locale ${value}, expected "${DEFAULT_LOCALE}"`,
    );
  return problems;
}
