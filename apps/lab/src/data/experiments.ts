import { localizedPath, type LocaleId } from "../../../../site/locales.ts";

export type ExperimentStatus = "active" | "done" | "archived";

/**
 * Selects a bespoke Astro component to render inside the "experiment"
 * section of the experiment page. Optional: an experiment without a
 * dedicated interactive surface still gets the full metadata/prose page,
 * just without this section.
 */
export type ExperimentSurface =
  | "filename-classifier"
  | "execution-states"
  | "boot-sector"
  | "scheduler-simulator"
  | "pathfinding-playground"
  | "tiny-language-playground"
  | "image-compression-lab";

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
  /** Pinned revision of the source project; absent when the experiment has no source project. */
  revision?: string;
  fidelity: "runs here" | "simulated" | "source only";
  created: string;
  source?: string;
  what: string;
  notes?: string;
  /**
   * The title is a plural noun phrase ("estados de execução"), so words that
   * agree with it in a sentence take the plural. Only a translation needs it.
   */
  titlePlural?: boolean;
  surface?: ExperimentSurface;
}

/** Real experiments, ordered by descending publication number. */
export const experiments: Experiment[] = [
  {
    id: "007",
    contentId: "007",
    locale: "en",
    originalLocale: "en",
    slug: "image-compression-lab",
    surface: "image-compression-lab",
    title: "image compression lab",
    description: "what quality, size and format do to a file and a picture",
    status: "active",
    project: "mochifile",
    revision: "f674bf1",
    fidelity: "runs here",
    created: "2026-10-30",
    source: "https://github.com/mochifile/mochifile",
    what: "What do quality, size and format change about an image file, and what do they cost the picture? Re-encode a picture in your browser, read the real byte counts, slide between before and after, look at the difference and sweep the quality. It is a teaching bench, not a compressor; the image never leaves your browser.",
    notes:
      "Inspired by the problem Mochifile solves, not by its interface or engine: Mochifile ships its own codecs so results match across browsers, while this page uses your browser’s encoders, so numbers differ. Revision f674bf1 is the Mochifile state read for its image-engine notes. Byte counts are measured; pixel sizes are labeled theoretical.",
  },
  {
    id: "006",
    contentId: "006",
    locale: "en",
    originalLocale: "en",
    slug: "tiny-language-playground",
    surface: "tiny-language-playground",
    title: "tiny language playground",
    description: "tokens, a syntax tree, diagnostics and a bounded interpreter",
    status: "active",
    project: "yanawa",
    revision: "7fd082e",
    fidelity: "simulated",
    created: "2026-10-30",
    source: "https://github.com/yanawa/yanawa",
    what: "What does a language do with a few lines of source before it runs them? Edit a small program and see its tokens, its syntax tree, readable errors and a bounded run, one stage at a time. The syntax is a small subset read from yanawa’s design notes; yanawa has no compiler yet, and this is not it.",
    notes:
      "Based on the syntax and compiler-architecture notes of yanawa revision 7fd082e. The notes leave several rules open (range ends, integer division, indentation width) and this page chose its own. Nothing is compiled or evaluated as JavaScript, and the source is never stored or sent.",
  },
  {
    id: "005",
    contentId: "005",
    locale: "en",
    originalLocale: "en",
    slug: "pathfinding-playground",
    surface: "pathfinding-playground",
    title: "pathfinding playground",
    description: "BFS, DFS, Dijkstra and A* exploring a grid you draw",
    status: "active",
    project: "algorithms",
    fidelity: "runs here",
    created: "2026-10-30",
    what: "How do four pathfinding algorithms differ on the same grid? Draw walls and mud, move the start and the goal, then step through breadth-first search, depth-first search, Dijkstra and A* and watch the frontier, the explored cells and the final path. Everything runs in this browser; it is not tied to any project.",
    notes:
      "A teaching implementation written for the Lab, with fixed tie-breaking so every run repeats. Movement is four-directional and mud is the only weight. Explored counts are not timings.",
  },
  {
    id: "004",
    contentId: "004",
    locale: "en",
    originalLocale: "en",
    slug: "scheduler-simulator",
    surface: "scheduler-simulator",
    title: "scheduler simulator",
    description: "queues, slots, retries and timeouts on a deterministic clock",
    status: "active",
    project: "orbit",
    revision: "2967494",
    fidelity: "simulated",
    created: "2026-10-30",
    source: "https://github.com/RaioViajante/orbit",
    what: "What happens to a job when slots are limited, an attempt fails, or a timeout fires? A teaching model of a job scheduler: change durations, retries, backoff and failures, then step through the queue one tick at a time. It illustrates the idea behind Orbit’s job settings; Orbit has no scheduler yet, and this page does not run it.",
    notes:
      "Inspired by the job settings in Orbit revision 2967494 (maximum retries and execution timeout). Orbit’s architecture notes put retries and workers outside its initial scope, so no Orbit behavior is reproduced. Time is an integer clock, nothing runs in the background, and nothing is stored.",
  },
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
    ...original("007"),
    locale: "pt-BR",
    slug: "compressao-de-imagens",
    title: "laboratório de compressão de imagens",
    description:
      "o que qualidade, tamanho e formato fazem com um arquivo e com a imagem",
    what: "O que qualidade, tamanho e formato mudam num arquivo de imagem, e quanto custam à imagem? Recodifique uma imagem no navegador, leia as contagens reais de bytes, deslize entre antes e depois, veja a diferença e varra as qualidades. É uma bancada didática, não um compressor; a imagem nunca sai do seu navegador.",
    notes:
      "Inspirado no problema que o Mochifile resolve, não na interface nem no motor dele: o Mochifile usa codecs próprios para que os resultados sejam iguais entre navegadores, enquanto esta página usa os codificadores do seu navegador, então os números mudam. A revisão f674bf1 é o estado do Mochifile lido para as notas do motor de imagens. As contagens de bytes são medidas; os tamanhos de pixels são rotulados como teóricos.",
  },
  {
    ...original("006"),
    locale: "pt-BR",
    slug: "linguagem-minima",
    title: "playground de linguagem mínima",
    description:
      "tokens, árvore sintática, diagnósticos e um interpretador limitado",
    what: "O que uma linguagem faz com algumas linhas de código antes de executá-las? Edite um programa pequeno e veja seus tokens, sua árvore sintática, erros legíveis e uma execução limitada, uma etapa por vez. A sintaxe é um pequeno subconjunto lido das notas de design do yanawa; o yanawa ainda não tem compilador, e este não é ele.",
    notes:
      "Baseado nas notas de sintaxe e de arquitetura do compilador da revisão 7fd082e do yanawa. As notas deixam várias regras em aberto (fim do intervalo, divisão de inteiros, largura da indentação) e esta página fez suas próprias escolhas. Nada é compilado nem avaliado como JavaScript, e o código nunca é guardado nem enviado.",
  },
  {
    ...original("005"),
    locale: "pt-BR",
    slug: "busca-de-caminhos",
    title: "busca de caminhos",
    description:
      "BFS, DFS, Dijkstra e A* explorando uma grade que você desenha",
    what: "Como quatro algoritmos de busca de caminhos se comportam na mesma grade? Desenhe paredes e lama, mova o início e o destino e avance pela busca em largura, pela busca em profundidade, por Dijkstra e por A*, observando a fronteira, as células exploradas e o caminho final. Tudo roda neste navegador; o experimento não está ligado a nenhum projeto.",
    notes:
      "Uma implementação didática escrita para o Lab, com critérios de desempate fixos para que toda busca se repita igual. O movimento é em quatro direções e a lama é o único peso. Células exploradas não são medidas de tempo.",
  },
  {
    ...original("004"),
    locale: "pt-BR",
    slug: "simulador-de-agendamento",
    title: "simulador de agendamento",
    description:
      "filas, vagas, retries e timeouts em um relógio determinístico",
    what: "O que acontece com um job quando as vagas são limitadas, uma tentativa falha ou um timeout dispara? Um modelo didático de agendador de jobs: mude durações, retries, backoff e falhas e avance pela fila um tick por vez. Ele ilustra a ideia por trás das configurações de job do Orbit; o Orbit ainda não tem agendador, e esta página não o executa.",
    notes:
      "Inspirado nas configurações de job da revisão 2967494 do Orbit (máximo de retries e timeout de execução). As notas de arquitetura do Orbit deixam retries e workers fora do escopo inicial, então nenhum comportamento do Orbit é reproduzido. O tempo é um relógio de números inteiros, nada roda em segundo plano e nada é guardado.",
  },
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
    titlePlural: true,
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
    description: "descubra como o Sweep classifica um nome de arquivo",
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
