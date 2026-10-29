import type { LocaleId } from "../../../../site/locales.ts";

/**
 * The plural categories Lab's copy needs. Both supported languages distinguish
 * only "one" from everything else, and zero takes the plural: "0 experiments"
 * and "0 experimentos". CLDR treats 0 as "one" in Brazilian Portuguese, but
 * "0 arquivo classificado" reads wrong in an interface, so zero is plural in
 * both locales. A third locale must declare its own rule here (the record is
 * exhaustive over the registry).
 */
export type PluralCategory = "one" | "other";

const rules = {
  en: (count) => (count === 1 ? "one" : "other"),
  "pt-BR": (count) => (count === 1 ? "one" : "other"),
} satisfies Record<LocaleId, (count: number) => PluralCategory>;

export function pluralCategory(
  locale: LocaleId,
  count: number,
): PluralCategory {
  return rules[locale](count);
}

/** The singular and plural wording of a counted noun phrase. */
export interface PluralForms {
  one: string;
  other: string;
}

/** `3 experiments`, `1 experimento`: the count, then the matching form. */
export function counted(
  locale: LocaleId,
  count: number,
  forms: PluralForms,
): string {
  return `${count} ${forms[pluralCategory(locale, count)]}`;
}
