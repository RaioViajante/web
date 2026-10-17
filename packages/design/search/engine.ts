import { participates, type LocaleId } from "../../../site/locales";
import { SITES, type SiteId } from "../../../site/sites";
import type { SearchEntry } from "../components/search";
import { normalizeSearchText } from "./locale";

/** Every word of the query must appear in the title, description or body. */
export function matches(entry: SearchEntry, words: string[], locale: LocaleId) {
  const text = normalizeSearchText(
    `${entry.title} ${entry.description} ${entry.body ?? ""}`,
    locale,
  );
  return words.every((word) => text.includes(word));
}

/**
 * Entries matching the query in the requested locale. The locale is explicit:
 * it is never read from the entries. Reader integrity (`validateIndex`) is a
 * separate contract; mixed-locale arrays are not filtered here.
 */
export function searchEntries(
  entries: readonly SearchEntry[],
  query: string,
  locale: LocaleId,
  limit = 40,
) {
  const words = normalizeSearchText(query.trim(), locale)
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return [];
  return entries
    .filter((entry) => matches(entry, words, locale))
    .slice(0, limit);
}

export interface EverywhereIndex {
  /** This site's entries and those of every host that answered, all in one locale. */
  entries: SearchEntry[];
  /** Participating sites whose index could not be fetched or was invalid; their results are left out. */
  unavailable: SiteId[];
  /** Sites that do not participate in the locale: not fetched, not unreachable. */
  skipped: SiteId[];
}

/**
 * Merge this site's index with every other participating site's, within one
 * locale. A participating site that cannot be reached, or that answers with
 * the wrong site or locale (`read` throws), is reported, never thrown: the rest
 * still searches. A participating site with an empty index succeeded. A site
 * that does not participate in the locale is skipped without a request;
 * participation, not probing, decides.
 */
export async function loadEverywhere(
  currentSite: SiteId,
  locale: LocaleId,
  own: SearchEntry[],
  read: (site: SiteId) => Promise<SearchEntry[]>,
  isParticipating: (site: SiteId, locale: LocaleId) => boolean = participates,
): Promise<EverywhereIndex> {
  const others = SITES.filter((item) => item.id !== currentSite);
  const skipped = others
    .filter((item) => !isParticipating(item.id, locale))
    .map((item) => item.id);
  const active = others.filter((item) => !skipped.includes(item.id));
  const settled = await Promise.allSettled(active.map((item) => read(item.id)));
  const entries = [...own];
  const unavailable: SiteId[] = [];
  settled.forEach((result, index) => {
    if (result.status === "fulfilled") entries.push(...result.value);
    else if (active[index]) unavailable.push(active[index].id);
  });
  return { entries, unavailable, skipped };
}

export function unavailableNote(unavailable: readonly SiteId[]) {
  if (!unavailable.length) return "";
  const labels = SITES.filter((item) => unavailable.includes(item.id)).map(
    (item) => item.label,
  );
  return `couldn't reach ${labels.join(", ")}: showing the rest.`;
}
