import { LOCALES, type LocaleId } from "../../../../site/locales.ts";
import { siteOrigins } from "../../../../site/sites.ts";
import {
  experimentPath,
  experimentsFor,
  type Experiment,
} from "../data/experiments.ts";
import { textFor } from "./copy.ts";

/** The shape of an entry in Lab's `/search-index.json`, per `SearchEntry` in the design package. */
export interface LabSearchEntry {
  site: "lab";
  locale: LocaleId;
  contentId: string;
  title: string;
  href: string;
  description: string;
  body: string;
  number: string;
}

/**
 * One entry per published experiment of a locale. The English index keeps its
 * original shape, including the raw fidelity key in `description`; the
 * Portuguese one shows the localized fidelity label.
 */
export function searchEntries(locale: LocaleId): LabSearchEntry[] {
  return experimentsFor(locale).map((item) => ({
    site: "lab",
    locale,
    contentId: item.contentId,
    title: item.title,
    href: `${siteOrigins.lab}${experimentPath(item)}`,
    description: `${item.project} · ${fidelityWord(item)}`,
    body: `${item.description} ${item.what} ${item.notes ?? ""}`,
    number: item.id,
  }));
}

function fidelityWord(item: Experiment): string {
  return LOCALES[item.locale].language === "en"
    ? item.fidelity
    : textFor(item.locale).fidelityLabel[item.fidelity];
}

export interface SearchSuggestions {
  site: readonly string[];
  everywhere: readonly string[];
}

/**
 * Terms offered when a search finds nothing. English keeps the shared defaults
 * (they match the English index). Every Portuguese term finds a published
 * Portuguese experiment: a test applies the engine's matching rule to the
 * index, and the browser check clicks each one.
 */
export const searchSuggestions = {
  en: undefined,
  "pt-BR": {
    site: [
      "classificador",
      "execução",
      "boot",
      "caminhos",
      "linguagem",
      "compressão",
    ],
    everywhere: [
      "classificador",
      "execução",
      "boot",
      "caminhos",
      "linguagem",
      "compressão",
    ],
  },
} satisfies Record<LocaleId, SearchSuggestions | undefined>;
