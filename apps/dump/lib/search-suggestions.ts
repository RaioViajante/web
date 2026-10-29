import type { LocaleId } from "../../../site/locales";

/**
 * Search suggestions offered when nothing matched. The shared defaults are
 * English words that match nothing in the Portuguese indexes, so Portuguese
 * passes its own. Every `site` term finds a published Dump entry of that
 * locale (a test runs each one through the same matching rule against the
 * real index). The `everywhere` terms depend on other hosts' Portuguese
 * content: "galeria" is a Root page title, "sweep" the Docs Sweep page and
 * "classificador" the Lab file classifier experiment. If one of those hosts
 * retitles or withdraws that entry, update this list; the e2e spec
 * (`e2e/dump-locale-navigation.spec.ts`) clicks each one against the built
 * Root, Docs and Lab indexes and fails when a suggestion stops finding results.
 * English keeps the shared defaults.
 */
export const searchSuggestions: Partial<
  Record<LocaleId, { site: readonly string[]; everywhere: readonly string[] }>
> = {
  "pt-BR": {
    site: ["orbit", "assembly", "linguagem", "agendador"],
    everywhere: ["galeria", "sweep", "classificador"],
  },
};
