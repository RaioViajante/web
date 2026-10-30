import { countedFor } from "./plural-core.ts";
import type { SchedulerCopy } from "./scheduler-copy.ts";
import {
  countLimits,
  type CountTable,
  type CountedPhrase,
  type Counter,
} from "./scheduler-view.ts";

// Build-time and test side of the counted phrases. The browser never imports
// this file: it receives the rendered `CountTable` instead of the plural rules.

/** Counter backed by the catalog and the platform's plural rules (server and tests). */
export function catalogCounter(
  copy: SchedulerCopy,
  intlLocale: string,
): Counter {
  return (phrase, count) => countedFor(intlLocale, count, copy[phrase]);
}

/**
 * Every rendering a page can ask for, rendered at build time, so the browser
 * ships no plural-rule code: the script only looks the sentence up.
 */
export function countTable(count: Counter): CountTable {
  const table = {} as CountTable;
  for (const phrase of Object.keys(countLimits) as CountedPhrase[])
    table[phrase] = Array.from({ length: countLimits[phrase] + 1 }, (_, n) =>
      count(phrase, n),
    );
  return table;
}
