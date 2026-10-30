import { LOCALES, type LocaleId } from "../../../../site/locales.ts";
import type { Experiment, ExperimentStatus } from "../data/experiments.ts";
import { formatDate } from "./date.ts";
import { experimentCount } from "./experiment-count.ts";

// Lab's own interface and editorial text, one complete catalog per registry
// locale (docs/i18n.md, "Shared UI catalogs"). `Record<LocaleId, LabCopy>`
// makes a missing locale or key a type error, and nothing falls back to
// English. Shared shell text stays in `packages/design`; bench strings live in
// `bench-copy.ts`; legal prose in `components/LegalPages.tsx`.

type Fidelity = Experiment["fidelity"];

export interface LabCopy {
  tagline: string;
  /** Meta description of the home page. */
  description: string;
  avatar: { label: string; reduced: string };
  /** Page-navigation labels, lower case like the rest of the shell. */
  nav: { experiments: string; notebook: string };
  headings: {
    experiments: string;
    whatRuns: string;
    notebook: string;
    question: string;
    bench: string;
    fidelity: string;
    related: string;
  };
  filters: { aria: string; all: string; active: string; done: string };
  /** "1 experiment", "3 experiments": the filter result. */
  count: (count: number) => string;
  status: Record<ExperimentStatus, string>;
  fidelityLabel: Record<Fidelity, string>;
  fidelityHelp: Record<Fidelity, string>;
  fields: {
    /** Caps label above an experiment title: "EXPERIMENT 003 · project". */
    experiment: string;
    created: string;
    source: string;
  };
  /**
   * Notebook entry suffix: "boot sector published". Takes whether the title is
   * a plural noun phrase so a participle can agree ("estados de execução
   * registrados").
   */
  published: (titlePlural: boolean) => string;
  /** "All experiments", the pager's way back to the index. */
  all: string;
  notebookIntro: string;
  /** Qualifier of a link whose destination is in another language. */
  inLanguage: (language: string) => string;
  /** Language names as written in this catalog's language, by locale. */
  languageNames: Record<LocaleId, string>;
  search: { title: string; description: string };
  legal: {
    terms: { title: string; description: string };
    privacy: { title: string; description: string };
    back: string;
    also: string;
  };
}

export const copy = {
  en: {
    tagline: "things may break.",
    description: "lab.raioviajante.com — things may break.",
    avatar: {
      label: "Flip RaioViajante avatar",
      reduced: "Illustrated RaioViajante character",
    },
    nav: { experiments: "experiments", notebook: "notebook" },
    headings: {
      experiments: "Experiments",
      whatRuns: "What runs here",
      notebook: "Notebook",
      question: "Question",
      bench: "Bench",
      fidelity: "Fidelity",
      related: "Related",
    },
    filters: {
      aria: "Filter experiments",
      all: "all",
      active: "active",
      done: "done",
    },
    count: (count) => experimentCount("en", count),
    status: { active: "active", done: "done", archived: "archived" },
    fidelityLabel: {
      "runs here": "runs here",
      simulated: "simulated",
      "source only": "source only",
    },
    fidelityHelp: {
      "runs here": "the real logic, executed in your browser",
      simulated: "rules ported from a pinned revision",
      "source only":
        "real code to read; results are documented, not reproduced",
    },
    fields: {
      experiment: "EXPERIMENT",
      created: "created",
      source: "source ↗",
    },
    published: () => "published",
    all: "All experiments",
    notebookIntro:
      "Short dated entries: what changed, what broke, what got answered.",
    inLanguage: (language) => `in ${language}`,
    languageNames: { en: "English", "pt-BR": "Portuguese" },
    search: {
      title: "search",
      description:
        "Ask RaioViajante — search lab experiments and the ecosystem.",
    },
    legal: {
      terms: {
        title: "Terms of Use",
        description: "Terms of Use for lab.raioviajante.com.",
      },
      privacy: {
        title: "Privacy Policy",
        description: "Privacy Policy for lab.raioviajante.com.",
      },
      back: "← Back",
      also: "Also →",
    },
  },
  "pt-BR": {
    tagline: "experimentos podem falhar.",
    description:
      "Experimentos técnicos do RaioViajante, com limites e código-fonte documentados.",
    avatar: {
      label: "Girar o avatar do RaioViajante",
      reduced: "Personagem ilustrado do RaioViajante",
    },
    nav: { experiments: "experimentos", notebook: "caderno" },
    headings: {
      experiments: "Experimentos",
      whatRuns: "O que funciona aqui",
      notebook: "Caderno",
      question: "Pergunta",
      bench: "Bancada",
      fidelity: "Fidelidade",
      related: "Relacionados",
    },
    filters: {
      aria: "Filtrar experimentos",
      all: "todos",
      active: "ativos",
      done: "concluídos",
    },
    count: (count) => experimentCount("pt-BR", count),
    status: { active: "ativo", done: "concluído", archived: "arquivado" },
    fidelityLabel: {
      "runs here": "executa aqui",
      simulated: "simulado",
      "source only": "apenas código-fonte",
    },
    fidelityHelp: {
      "runs here": "a lógica real, executada no seu navegador",
      simulated: "regras reproduzidas de uma revisão específica",
      "source only":
        "código real para leitura; resultados documentados, não reproduzidos",
    },
    fields: {
      experiment: "EXPERIMENTO",
      created: "criado em",
      source: "código-fonte ↗",
    },
    published: (titlePlural) => (titlePlural ? "registrados" : "registrado"),
    all: "Todos os experimentos",
    notebookIntro:
      "Registros curtos e datados: o que mudou, o que quebrou, o que foi respondido.",
    inLanguage: (language) => `em ${language}`,
    languageNames: { en: "inglês", "pt-BR": "português" },
    search: {
      title: "busca",
      description: "Busque experimentos do Lab e nos sites do RaioViajante.",
    },
    legal: {
      terms: {
        title: "Termos de Uso",
        description: "Termos de Uso de lab.raioviajante.com.",
      },
      privacy: {
        title: "Política de Privacidade",
        description: "Política de Privacidade de lab.raioviajante.com.",
      },
      back: "← Voltar",
      also: "Veja também →",
    },
  },
} satisfies Record<LocaleId, LabCopy>;

export function textFor(locale: LocaleId): LabCopy {
  return copy[locale];
}

/** The experiment's creation date in its locale's long format (UTC). */
export function displayDate(experiment: Experiment): string {
  return formatDate(experiment.locale, experiment.created);
}

/** The `lang` a fragment in `language` needs on a `locale` page, if any. */
export function foreignLang(
  locale: LocaleId,
  language: LocaleId,
): string | undefined {
  return language === locale ? undefined : LOCALES[language].htmlLang;
}
