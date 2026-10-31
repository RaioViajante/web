import { formFor } from "./plural-core.ts";
import type { OneCounts } from "./plural-lookup.ts";

/** Build-time side of `pickForm`: which counts from 0 to `max` CLDR files under "one" for `intlLocale`. */
export function oneCountsFor(intlLocale: string, max: number): OneCounts {
  const probe = { one: "one", other: "other" };
  return Array.from({ length: max + 1 }, (_, n) => n).filter(
    (n) => formFor(intlLocale, n, probe) === "one",
  );
}
