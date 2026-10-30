import type { LocaleId } from "../../../../site/locales.ts";
import { counted, type PluralForms } from "./plural.ts";

const forms = {
  en: { one: "{count} experiment", other: "{count} experiments" },
  "pt-BR": {
    one: "{count} experimento",
    other: "{count} experimentos",
    none: "nenhum experimento",
  },
} satisfies Record<LocaleId, PluralForms>;

/** The wording of the experiment count in each locale, for the browser filter. */
export function experimentForms(locale: LocaleId): PluralForms {
  return forms[locale];
}

/**
 * "1 experiment", "3 experiments", "1 experimento", "3 experimentos", "nenhum
 * experimento": the index filter's live result, shared by the static markup and
 * the browser script so neither hard-codes a count.
 */
export function experimentCount(locale: LocaleId, count: number): string {
  return counted(locale, count, forms[locale]);
}
