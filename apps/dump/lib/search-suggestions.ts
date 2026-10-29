import type { LocaleId } from "../../../site/locales";

/**
 * Search suggestions offered when nothing matched. The shared defaults are
 * English words that match nothing in the Portuguese indexes, so Portuguese
 * passes its own. Every `site` term finds a published Dump entry of that
 * locale (a test runs each one through the shared search engine against the
 * real index); `everywhere` terms each find an entry on one other host's
 * Portuguese index (checked in the browser pass against the built hosts).
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
