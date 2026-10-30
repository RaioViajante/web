import type { LocaleId } from "../../../site/locales";

// The automatic "Try it" suggestion at the end of a post: the Lab experiment
// that matches the post's series or topic, in the post's own language. A
// locale has an entry only when that Lab page is published in that locale; an
// absent entry shows no suggestion (docs/i18n.md, "Cross-language related
// links"), never the other language's page.
export type LabTarget =
  "boot-sector" | "execution-states" | "filename-classifier";

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
    "execution-states": {
      title: "Execution states",
      href: "https://lab.raioviajante.com/experiments/execution-states/",
    },
    "filename-classifier": {
      title: "Filename classifier",
      href: "https://lab.raioviajante.com/experiments/filename-classifier/",
    },
  },
  // Lab's Portuguese experiment pages, all three published.
  "pt-BR": {
    "boot-sector": {
      title: "Setor de boot",
      href: "https://lab.raioviajante.com/pt/experiments/setor-de-boot/",
    },
    "execution-states": {
      title: "Estados de execução",
      href: "https://lab.raioviajante.com/pt/experiments/estados-de-execucao/",
    },
    "filename-classifier": {
      title: "Classificador de arquivos",
      href: "https://lab.raioviajante.com/pt/experiments/classificador-de-arquivos/",
    },
  },
} satisfies Record<LocaleId, Partial<Record<LabTarget, LabSuggestion>>>;
