import { LOCALES, type LocaleId } from "../../../../site/locales.ts";
import { fill } from "./template.ts";

// Count-aware wording. The grammatical category comes from the platform's CLDR
// data (`Intl.PluralRules`) for the registry's `intlLocale`, so no locale's rule
// is hand-written here. Two things CLDR cannot decide are decided by the
// catalog, as explicit wording:
//
// - Brazilian Portuguese puts both 0 and 1 in the category "one" (CLDR). The
//   rule is right ("0,5 arquivo", "1 arquivo"), but a bare "0 arquivo
//   classificado" reads wrong in an interface, and so does "0 arquivos". Every
//   counted phrase therefore carries a `none` sentence for zero where CLDR
//   would pick "one" ("nenhum arquivo classificado"). It says what the number
//   says, nothing more. A test enforces this for every phrase and locale.
// - English zero is plural ("0 files sorted") and needs no `none`.
//
// Counts here are whole numbers (items on a page, lines in a table); a
// fraction or a negative number is a bug and throws.

/**
 * The wording of one counted phrase. Each form is a complete sentence fragment
 * with a `{count}` placeholder, because the number's position and the noun's
 * agreement are the locale's business, not the caller's.
 */
export interface PluralForms {
  /** Exactly the "one" category; the first two forms of a locale that has them. */
  one: string;
  /** Every other category the locale has (CLDR "many", "few", ... are not used). */
  other: string;
  /** Zero, when it needs its own wording; see above. */
  none?: string;
}

/** The CLDR plural category of `count` in `locale`. */
export function pluralCategory(
  locale: LocaleId,
  count: number,
): Intl.LDMLPluralRule {
  return new Intl.PluralRules(LOCALES[locale].intlLocale).select(count);
}

/** Which of `forms` applies to `count` in `locale`. */
export function pluralForm(
  locale: LocaleId,
  count: number,
  forms: PluralForms,
): string {
  if (!Number.isInteger(count) || count < 0)
    throw new RangeError(`Counts are whole numbers, got ${count}`);
  if (count === 0 && forms.none !== undefined) return forms.none;
  return pluralCategory(locale, count) === "one" ? forms.one : forms.other;
}

/** `3 experiments`, `1 experimento`, `nenhum experimento`: the matching form, filled. */
export function counted(
  locale: LocaleId,
  count: number,
  forms: PluralForms,
): string {
  return fill(pluralForm(locale, count, forms), { count });
}

/** Whether `locale`'s CLDR rule files zero under "one", so wording must supply `none`. */
export function zeroReadsAsOne(locale: LocaleId): boolean {
  return pluralCategory(locale, 0) === "one";
}
