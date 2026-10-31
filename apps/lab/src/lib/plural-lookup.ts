import { fill } from "./template.ts";
import type { PluralForms } from "./plural-core.ts";

// Count-aware wording for browser scripts that must not ship plural-rule code:
// the build lists the counts that take the "one" wording (`oneCountsFor`, in
// plural-lookup-build.ts) and the script applies it with `pickForm`. A test
// compares both with `countedFor`. `display` replaces `{count}` in the text, for
// numbers the page formats itself (thousands separators).

export type OneCounts = readonly number[];

export function pickForm(
  forms: PluralForms,
  count: number,
  oneCounts: OneCounts,
  display?: string,
): string {
  if (!Number.isInteger(count) || count < 0)
    throw new RangeError(`Counts are whole numbers, got ${count}`);
  const shown = display ?? count;
  if (count === 0 && forms.none !== undefined)
    return fill(forms.none, { count: shown });
  return fill(oneCounts.includes(count) ? forms.one : forms.other, {
    count: shown,
  });
}
