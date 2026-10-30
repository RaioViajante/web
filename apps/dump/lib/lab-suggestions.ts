import type { LocaleId } from "../../../site/locales";

// The automatic "Try it" suggestion at the end of a post: the Lab experiment
// that matches the post's topic, in the post's own language. A
// locale has an entry only when that Lab page is published in that locale; an
// absent entry shows no suggestion (docs/i18n.md, "Cross-language related
// links"), never the other language's page.
export type LabTarget = "boot-sector";

export interface LabSuggestion {
  title: string;
  href: string;
}

export const labSuggestions = {
  en: {
    "boot-sector": {
      title: "Boot sector",
      href: "https://lab.raioviajante.com/experiments/boot-sector/",
    },
  },
  // Lab's Portuguese boot-sector page, published.
  "pt-BR": {
    "boot-sector": {
      title: "Setor de boot",
      href: "https://lab.raioviajante.com/pt/experiments/setor-de-boot/",
    },
  },
} satisfies Record<LocaleId, Partial<Record<LabTarget, LabSuggestion>>>;
