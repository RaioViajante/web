import { SITES, type SiteId } from "../components/sites";
import type { SearchEntry } from "../components/search";

/** Every word of the query must appear in the title, description or body. */
export function matches(entry: SearchEntry, words: string[]) {
  const text =
    `${entry.title} ${entry.description} ${entry.body ?? ""}`.toLocaleLowerCase();
  return words.every((word) => text.includes(word));
}

export function searchEntries(
  entries: readonly SearchEntry[],
  query: string,
  limit = 40,
) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return entries.filter((entry) => matches(entry, words)).slice(0, limit);
}

export interface EverywhereIndex {
  entries: SearchEntry[];
  /** Sites whose index could not be fetched; their results are left out. */
  unavailable: SiteId[];
}

/**
 * Merge this site's index with every other site's. A site that cannot be
 * reached is reported, never thrown: the rest still searches.
 */
export async function loadEverywhere(
  currentSite: SiteId,
  own: SearchEntry[],
  read: (site: SiteId) => Promise<SearchEntry[]>,
): Promise<EverywhereIndex> {
  const others = SITES.filter((item) => item.id !== currentSite);
  const settled = await Promise.allSettled(others.map((item) => read(item.id)));
  const entries = [...own];
  const unavailable: SiteId[] = [];
  settled.forEach((result, index) => {
    if (result.status === "fulfilled") entries.push(...result.value);
    else if (others[index]) unavailable.push(others[index].id);
  });
  return { entries, unavailable };
}

export function unavailableNote(unavailable: readonly SiteId[]) {
  if (!unavailable.length) return "";
  const labels = SITES.filter((item) => unavailable.includes(item.id)).map(
    (item) => item.label,
  );
  return `couldn't reach ${labels.join(", ")}: showing the rest.`;
}
