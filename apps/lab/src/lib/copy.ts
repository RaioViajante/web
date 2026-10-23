import { LOCALES, type LocaleId } from "../../../../site/locales.ts";
import type { Experiment } from "../data/experiments.ts";

export const copy = {
  en: {
    tagline: "things may break.",
    search: "search",
    experiments: "Experiments",
    notebook: "Notebook",
    question: "Question",
    bench: "Bench",
    fidelity: "Fidelity",
    related: "Related",
    status: { active: "active", done: "done", archived: "archived" },
    fidelityLabel: {
      "runs here": "runs here",
      simulated: "simulated",
      "source only": "source only",
    },
    filters: { all: "all", active: "active", done: "done" },
    count: (n: number) => `${n} ${n === 1 ? "experiment" : "experiments"}`,
    created: "created",
    source: "source ↗",
    published: "published",
    all: "All experiments",
    whatRuns: "What runs here",
    notebookIntro:
      "Short dated entries: what changed, what broke, what got answered.",
    fidelityHelp: [
      "the real logic, executed in your browser",
      "rules ported from a pinned revision",
      "real code to read; results are documented, not reproduced",
    ],
  },
  "pt-BR": {
    tagline: "experimentos podem falhar.",
    search: "busca",
    experiments: "Experimentos",
    notebook: "Caderno",
    question: "Pergunta",
    bench: "Bancada",
    fidelity: "Fidelidade",
    related: "Relacionados",
    status: { active: "ativo", done: "concluído", archived: "arquivado" },
    fidelityLabel: {
      "runs here": "executa aqui",
      simulated: "simulado",
      "source only": "apenas código-fonte",
    },
    filters: { all: "todos", active: "ativos", done: "concluídos" },
    count: (n: number) => `${n} ${n === 1 ? "experimento" : "experimentos"}`,
    created: "criado em",
    source: "código-fonte ↗",
    published: "registrado",
    all: "Todos os experimentos",
    whatRuns: "O que funciona aqui",
    notebookIntro: "Registros dos experimentos e de seus limites.",
    fidelityHelp: [
      "a lógica real, executada no seu navegador",
      "regras reproduzidas de uma revisão específica",
      "código real para leitura; resultados documentados, não reproduzidos",
    ],
  },
} as const;

export function displayDate(experiment: Experiment): string {
  if (experiment.locale === "en") return experiment.created;
  return new Intl.DateTimeFormat(LOCALES[experiment.locale].intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${experiment.created}T00:00:00Z`));
}

export function textFor(locale: LocaleId) {
  return copy[locale];
}

export const classifierCopy = {
  en: {
    caption: "bench · runs in this browser",
    reset: "reset",
    directory: "Directory",
    filenames: "Filenames · one per line",
    try: "try",
    headers: ["file", "suffix", "category", "destination"],
    categories: {
      Images: "Images",
      Documents: "Documents",
      Archives: "Archives",
      Other: "Other",
    },
    none: "(none)",
    file: "file",
    files: "files",
    classified: "classified",
    why: 'Why .hidden is "Other"',
    explanation:
      "Python 3.14 Path.suffix treats a leading dot as part of the name. Only the final suffix counts: archive.tar.gz uses .gz. A trailing dot is suffix ., so image. is Other. Filename spaces are preserved. Destinations are previews; no files move.",
    noscript:
      "The examples are precomputed. Enable JavaScript to try other filenames.",
  },
  "pt-BR": {
    caption: "bancada · executa neste navegador",
    reset: "reiniciar",
    directory: "Diretório",
    filenames: "Nomes de arquivo · um por linha",
    try: "testar",
    headers: ["arquivo", "extensão", "categoria", "destino"],
    categories: {
      Images: "Imagens",
      Documents: "Documentos",
      Archives: "Arquivos compactados",
      Other: "Outros",
    },
    none: "(nenhuma)",
    file: "arquivo",
    files: "arquivos",
    classified: "classificados",
    why: 'Por que .hidden é "Outros"',
    explanation:
      "Em Python 3.14, Path.suffix trata um ponto inicial como parte do nome. Apenas a última extensão conta: archive.tar.gz usa .gz. Um ponto final é a extensão ., então image. fica em Outros. Os espaços nos nomes são preservados. Os destinos são apenas prévias e mantêm os nomes de categoria usados pelo Sweep; nenhum arquivo é movido.",
    noscript:
      "Os exemplos já estão calculados. Ative o JavaScript para testar outros nomes de arquivo.",
  },
} as const;
