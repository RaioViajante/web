import { localizedPath, type LocaleId } from "../../../../site/locales.ts";

export type ExperimentStatus = "active" | "done" | "archived";

/**
 * Selects a bespoke Astro component to render inside the "experiment"
 * section of the experiment page. Optional: an experiment without a
 * dedicated interactive surface still gets the full metadata/prose page,
 * just without this section.
 */
export type ExperimentSurface =
  "filename-classifier" | "execution-states" | "boot-sector";

export interface Experiment {
  id: string;
  contentId: string;
  locale: LocaleId;
  originalLocale: LocaleId;
  slug: string;
  title: string;
  description: string;
  status: ExperimentStatus;
  project: string;
  revision: string;
  fidelity: "runs here" | "simulated" | "source only";
  created: string;
  source?: string;
  what: string;
  notes?: string;
  surface?: ExperimentSurface;
}

/** Real experiments, ordered by descending publication number. */
export const experiments: Experiment[] = [
  {
    id: "003",
    contentId: "003",
    locale: "en",
    originalLocale: "en",
    slug: "boot-sector",
    surface: "boot-sector",
    title: "boot sector",
    description: "the assembly behind a BIOS hello world",
    status: "done",
    project: "x86-os-experiment",
    revision: "e966889",
    fidelity: "source only",
    created: "2026-09-13",
    source: "https://github.com/RaioViajante/x86-os-experiment",
    what: "How does this boot sector get a message on screen using BIOS services? The actual assembly from an x86 learning experiment, alongside the behavior recorded in its learning notes. The Lab presents the source; it does not boot or emulate it.",
    notes:
      "Based on x86-os-experiment revision e966889. The Hello, World! result is documented in the project notes, not independently reproduced here.",
  },
  {
    id: "002",
    contentId: "002",
    locale: "en",
    originalLocale: "en",
    slug: "execution-states",
    surface: "execution-states",
    title: "execution states",
    description:
      "trying the transitions Orbit allows — and the ones it rejects",
    status: "active",
    project: "orbit",
    revision: "cd97666",
    fidelity: "simulated",
    created: "2026-09-13",
    source: "https://github.com/RaioViajante/orbit",
    what: "Which operations does each state accept, and what does a rejected one look like? An interactive representation of Orbit’s current Execution domain rules. State changes happen in this browser example: no commands run, and there is no scheduler behind the page.",
    notes:
      "Based on Orbit revision cd97666. Timestamps are browser-generated sample values, with no persistence. Retry and timeout settings are configuration only.",
  },
  {
    id: "001",
    contentId: "001",
    locale: "en",
    originalLocale: "en",
    slug: "filename-classifier",
    surface: "filename-classifier",
    title: "filename classifier",
    description: "seeing where Sweep puts a filename",
    status: "active",
    project: "sweep",
    revision: "3544d36",
    fidelity: "runs here",
    created: "2026-09-13",
    source: "https://github.com/RaioViajante/sweep",
    what: "Given only a filename, which category does Sweep pick, and where would the file end up? Sweep classifies files by their final extension before deciding where they belong. This reproduces that small part of its current behavior in the browser; Sweep itself is not running here.",
    notes:
      "Based on Sweep revision 3544d36. Only filename extensions are considered. No files are uploaded, inspected, or moved.",
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((experiment) => experiment.slug === slug);
}

/** The English original of a work, whose stable facts every translation inherits. */
function original(id: string): Experiment {
  const found = experiments.find((experiment) => experiment.id === id);
  if (!found) throw new Error(`Unknown experiment ${id}`);
  return found;
}

/**
 * Published translations only, newest number first like the originals. Stable
 * facts (id, project, revision, dates, source, status, fidelity, surface) are
 * inherited from the English original; only authored text differs.
 */
export const portugueseExperiments: Experiment[] = [
  {
    ...original("003"),
    locale: "pt-BR",
    slug: "setor-de-boot",
    title: "setor de boot",
    description: "o assembly por trás de um hello world da BIOS",
    what: "Como este setor de boot coloca uma mensagem na tela usando serviços da BIOS? O assembly real de um experimento para aprender x86, junto com o comportamento registrado em suas anotações de aprendizado. O Lab apresenta o código-fonte; ele não faz o boot desse código nem o emula.",
    notes:
      "Baseado na revisão e966889 do x86-os-experiment. O resultado Hello, World! está documentado nas anotações do projeto e não foi reproduzido de forma independente aqui.",
  },
  {
    ...original("002"),
    locale: "pt-BR",
    slug: "estados-de-execucao",
    title: "estados de execução",
    description:
      "experimente as transições que o Orbit permite — e as que ele rejeita",
    what: "Quais operações cada estado aceita, e como é uma operação rejeitada? Uma representação interativa das regras atuais do domínio Execution do Orbit. As mudanças de estado acontecem neste exemplo no navegador: nenhum comando é executado e não há nenhum agendador por trás da página.",
    notes:
      "Baseado na revisão cd97666 do Orbit. Os timestamps são valores de exemplo gerados pelo navegador, sem persistência. As configurações de retry e timeout existem apenas como configuração.",
  },
  {
    ...original("001"),
    locale: "pt-BR",
    slug: "classificador-de-arquivos",
    title: "classificador de arquivos",
    description: "veja onde o Sweep coloca um nome de arquivo",
    what: "Com apenas um nome de arquivo, qual categoria o Sweep escolhe e qual seria o destino? O Sweep classifica pela última extensão antes de decidir onde o arquivo pertence. Esta página reproduz essa pequena parte do comportamento no navegador; o Sweep não está em execução aqui.",
    notes:
      "Baseado na revisão 3544d36 do Sweep. Apenas as extensões dos nomes são consideradas. Nenhum arquivo é enviado, inspecionado ou movido.",
  },
];

export const publishedExperiments = [...experiments, ...portugueseExperiments];

export function experimentsFor(locale: LocaleId): Experiment[] {
  return publishedExperiments.filter(
    (experiment) => experiment.locale === locale,
  );
}

export function experimentPath(experiment: Experiment): string {
  return localizedPath(
    "lab",
    experiment.locale,
    `/experiments/${experiment.slug}/`,
  );
}

export function counterpartsOf(experiment: Experiment) {
  return publishedExperiments
    .filter(
      (item) =>
        item.contentId === experiment.contentId &&
        item.locale !== experiment.locale,
    )
    .map((item) => ({ locale: item.locale, path: experimentPath(item) }));
}

export function validateExperiments(
  versions: readonly Experiment[],
  withdrawnOriginals: readonly {
    contentId: string;
    originalLocale: LocaleId;
  }[] = [],
): void {
  const keys = new Set<string>();
  const paths = new Set<string>();
  const tombstones = new Map<string, LocaleId>();
  for (const record of withdrawnOriginals) {
    if (tombstones.has(record.contentId))
      throw new Error(`Duplicate original provenance: ${record.contentId}`);
    tombstones.set(record.contentId, record.originalLocale);
  }
  for (const version of versions) {
    const key = `${version.contentId}:${version.locale}`;
    const path = experimentPath(version);
    if (keys.has(key) || paths.has(path))
      throw new Error(`Duplicate experiment version: ${key} ${path}`);
    keys.add(key);
    paths.add(path);
    const work = versions.filter(
      (item) => item.contentId === version.contentId,
    );
    const originals = work.filter(
      (item) => item.locale === item.originalLocale,
    ).length;
    if (
      originals +
        Number(tombstones.get(version.contentId) === version.originalLocale) !==
        1 ||
      work.some(
        (item) =>
          item.originalLocale !== version.originalLocale ||
          item.id !== version.id ||
          item.project !== version.project ||
          item.revision !== version.revision ||
          item.created !== version.created ||
          item.source !== version.source ||
          item.status !== version.status ||
          item.fidelity !== version.fidelity ||
          item.surface !== version.surface,
      )
    ) {
      throw new Error(
        `Inconsistent experiment provenance: ${version.contentId}`,
      );
    }
  }
  for (const id of tombstones.keys())
    if (!versions.some((item) => item.contentId === id))
      throw new Error(`Orphaned original provenance: ${id}`);
}

validateExperiments(publishedExperiments);
