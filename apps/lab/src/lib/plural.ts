import { LOCALES, type LocaleId } from "../../../../site/locales.ts";
import {
  categoryOf,
  countedFor,
  formFor,
  type PluralForms,
} from "./plural-core.ts";

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
//
// This module is the registry-aware API for the server and the tests. The
// browser scripts use `plural-core.ts` with an `Intl` locale string rendered
// into the page, so no locale registry ships to the client.

export type { PluralForms };

/** The CLDR plural category of `count` in `locale`. */
export function pluralCategory(
  locale: LocaleId,
  count: number,
): Intl.LDMLPluralRule {
  return categoryOf(LOCALES[locale].intlLocale, count);
}

/** Which of `forms` applies to `count` in `locale`. */
export function pluralForm(
  locale: LocaleId,
  count: number,
  forms: PluralForms,
): string {
  return formFor(LOCALES[locale].intlLocale, count, forms);
}

/** `3 experiments`, `1 experimento`, `nenhum experimento`: the matching form, filled. */
export function counted(
  locale: LocaleId,
  count: number,
  forms: PluralForms,
): string {
  return countedFor(LOCALES[locale].intlLocale, count, forms);
}

/** Whether `locale`'s CLDR rule files zero under "one", so wording must supply `none`. */
export function zeroReadsAsOne(locale: LocaleId): boolean {
  return pluralCategory(locale, 0) === "one";
}
