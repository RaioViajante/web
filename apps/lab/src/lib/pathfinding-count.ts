import { formFor } from "./plural-core.ts";
import type { OneCounts } from "./pathfinding-view.ts";

/** Build-time side of `pickForm`: which counts take the "one" wording in a locale. */
export function oneCountsFor(intlLocale: string, max: number): OneCounts {
  const probe = { one: "one", other: "other" };
  return Array.from({ length: max + 1 }, (_, n) => n).filter(
    (n) => formFor(intlLocale, n, probe) === "one",
  );
}
