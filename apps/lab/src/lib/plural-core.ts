import { fill } from "./template.ts";

// The locale-free half of count-aware wording, small enough to ship to the
// browser: it takes the `Intl` locale string (rendered into the page at build
// time) instead of looking a locale up in the registry. `plural.ts` is the
// registry-aware API for the server and the tests; see it for the policy.

/**
 * The wording of one counted phrase. Each form is a complete sentence fragment
 * with a `{count}` placeholder, because the number's position and the noun's
 * agreement are the locale's business, not the caller's.
 */
export interface PluralForms {
  /** Exactly the CLDR category "one". */
  one: string;
  /** Every other category (CLDR "many", "few", ... are not used in Lab). */
  other: string;
  /** Zero, when it needs its own wording (Portuguese: "nenhum arquivo"). */
  none?: string;
}

/** The CLDR plural category of `count` for an `Intl` locale. */
export function categoryOf(intlLocale: string, count: number) {
  return new Intl.PluralRules(intlLocale).select(count);
}

/** Which of `forms` applies to `count`. Counts are whole numbers. */
export function formFor(
  intlLocale: string,
  count: number,
  forms: PluralForms,
): string {
  if (!Number.isInteger(count) || count < 0)
    throw new RangeError(`Counts are whole numbers, got ${count}`);
  if (count === 0 && forms.none !== undefined) return forms.none;
  return categoryOf(intlLocale, count) === "one" ? forms.one : forms.other;
}

/** `3 experiments`, `1 experimento`, `nenhum experimento`: the matching form, filled. */
export function countedFor(
  intlLocale: string,
  count: number,
  forms: PluralForms,
): string {
  return fill(formFor(intlLocale, count, forms), { count });
}
