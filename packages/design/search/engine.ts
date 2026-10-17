import { participates, type LocaleId } from "../../../site/locales";
import { SITES, type SiteId } from "../../../site/sites";
import type { SearchEntry } from "../components/search";
import { catalogFor } from "../catalog";
import { normalizeSearchText, validateIndex } from "./locale";

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

/** How one host's index stands in a locale; #44 renders the words. */
export type SiteIndex =
  | { state: "ready"; entries: SearchEntry[] }
  /** Participating, but the fetch failed or the response was invalid. */
  | { state: "unavailable" }
  /** Not participating in the locale: never read. */
  | { state: "skipped" };

/**
 * Read one host's index for a locale. Participation is checked first, for the
 * current host as much as any other, so a non-participating host is never
 * requested. A participating host's response is validated against that host
 * and locale before it counts; an empty array is a valid `ready` index.
 */
export async function loadSiteIndex(
  site: SiteId,
  locale: LocaleId,
  read: (site: SiteId) => Promise<SearchEntry[]>,
  isParticipating: (site: SiteId, locale: LocaleId) => boolean = participates,
): Promise<SiteIndex> {
  if (!isParticipating(site, locale)) return { state: "skipped" };
  try {
    return {
      state: "ready",
      entries: validateIndex(await read(site), site, locale),
    };
  } catch {
    return { state: "unavailable" };
  }
}

/**
 * Merge this site's index with every other participating site's, within one
 * locale. `own` is validated against this site and the locale (a wrong one
 * throws: it is a caller error, not data). Every other host goes through
 * `loadSiteIndex`: a participating host that cannot be reached, or answers
 * with the wrong site or locale, is reported, never thrown, and the rest still
 * searches; an empty index succeeded; a host that does not participate is
 * skipped without a request. Participation, not probing, decides.
 */
export async function loadEverywhere(
  currentSite: SiteId,
  locale: LocaleId,
  own: SearchEntry[],
  read: (site: SiteId) => Promise<SearchEntry[]>,
  isParticipating: (site: SiteId, locale: LocaleId) => boolean = participates,
): Promise<EverywhereIndex> {
  const entries = [...validateIndex(own, currentSite, locale)];
  const others = SITES.filter((item) => item.id !== currentSite);
  const loaded = await Promise.all(
    others.map((item) => loadSiteIndex(item.id, locale, read, isParticipating)),
  );
  const unavailable: SiteId[] = [];
  const skipped: SiteId[] = [];
  loaded.forEach((index, i) => {
    const id = others[i]!.id;
    if (index.state === "ready") entries.push(...index.entries);
    else if (index.state === "skipped") skipped.push(id);
    else unavailable.push(id);
  });
  return { entries, unavailable, skipped };
}

/** Site labels, in registry order, for the given ids. */
const labelsOf = (ids: readonly SiteId[]) =>
  SITES.filter((item) => ids.includes(item.id))
    .map((item) => item.label)
    .join(", ");

/** The note for hosts that could not be reached; empty when there are none. */
export function unavailableNote(
  unavailable: readonly SiteId[],
  locale: LocaleId,
) {
  return unavailable.length
    ? catalogFor(locale).search.unreachable(labelsOf(unavailable))
    : "";
}

/**
 * The note for hosts that do not publish the locale yet: stated apart from
 * unreachable hosts, since nothing failed.
 */
export function skippedNote(skipped: readonly SiteId[], locale: LocaleId) {
  return skipped.length
    ? catalogFor(locale).search.notPublished(
        labelsOf(skipped),
        catalogFor(locale).lang.names[locale],
      )
    : "";
}
