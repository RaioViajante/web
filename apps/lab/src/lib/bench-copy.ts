import type { LocaleId } from "../../../../site/locales.ts";
import type { Operation, RejectionCode } from "./execution-states.ts";
import type { PluralForms } from "./plural.ts";

// The strings of the three interactive benches, one complete catalog per
// registry locale. The plain TypeScript scripts never choose a language: each
// bench renders its locale's strings into the page at build time (a
// `data-copy` attribute) and the script only fills the `{placeholders}`.
// Technical identifiers stay exact in every locale: Orbit's status values and
// field names, Sweep's category values, assembly, registers and hex.

/** Text with inline `code` spans, for sentences that quote identifiers. */
export type RichText = readonly (string | { readonly code: string })[];

export type ClassifierCategory = "Images" | "Documents" | "Archives" | "Other";

export interface ClassifierCopy {
  caption: string;
  reset: string;
  directory: string;
  filenames: string;
  try: string;
  headers: readonly [string, string, string, string];
  none: string;
  /**
   * A descriptive label shown beside each category in the table, or null when
   * the category value already reads in this language. The category value
   * itself is Sweep's, is never translated, and is what the destination uses.
   */
  categoryGloss: Record<ClassifierCategory, string | null>;
  /** "{count} files classified"; the summary lists real category values after it. */
  summary: PluralForms;
  why: string;
  explanation: RichText;
  noscript: string;
}

export interface ExecutionCopy {
  caption: string;
  newExample: string;
  lifecycleAria: string;
  /** Captions between the lifecycle states. */
  lifecycle: { start: string; finish: string; cancel: string };
  exitCodeLabel: string;
  failureMessageLabel: string;
  defaultFailureMessage: string;
  /** Button labels. The operation identifiers (`start`, ...) are Orbit's. */
  operations: Record<Operation, string>;
  initialFeedback: string;
  /** `{accepted}` and `{rejected}` are comma-separated operation labels. */
  availability: string;
  none: string;
  solidHelp: string;
  stateBand: string;
  clockHelp: string;
  historyBand: string;
  /** History line and live message templates. */
  messages: {
    created: string;
    accepted: string;
    rejected: string;
    newExample: string;
    historyAccepted: string;
    historyRejected: string;
  };
  reasons: Record<RejectionCode | "exit-code-range", string>;
  rules: {
    caption: string;
    headers: readonly [string, string, string, string];
    /** The `sets` cell of the failure rule. */
    failSets: string;
  };
  noscript: string;
}

export interface BootCopy {
  sectionNavAria: string;
  /** `{number}`, `{total}` and `{title}`. */
  progress: string;
  /** `{number}` and `{total}`. */
  rejectedPrevious: string;
  rejectedNext: string;
  previous: string;
  next: string;
  noteLabel: string;
  importantLabel: string;
  important: string;
  help: string;
  assemblyLink: string;
  resultTitle: string;
  noscript: string;
}

export const classifierCopy = {
  en: {
    caption: "bench · runs in this browser",
    reset: "reset",
    directory: "Directory",
    filenames: "Filenames · one per line",
    try: "try",
    headers: ["file", "suffix", "category", "destination"],
    none: "(none)",
    categoryGloss: {
      Images: null,
      Documents: null,
      Archives: null,
      Other: null,
    },
    summary: {
      one: "{count} file classified",
      other: "{count} files classified",
    },
    why: 'Why .hidden is "Other"',
    explanation: [
      "Python 3.14 ",
      { code: "Path.suffix" },
      " treats a leading dot as part of the name. Only the final suffix counts: ",
      { code: "archive.tar.gz" },
      " uses ",
      { code: ".gz" },
      ". A trailing dot is suffix ",
      { code: "." },
      ", so ",
      { code: "image." },
      " is Other. Filename spaces are preserved. Destinations are previews; no files move.",
    ],
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
    none: "(nenhuma)",
    categoryGloss: {
      Images: "imagens",
      Documents: "documentos",
      Archives: "arquivos compactados",
      Other: "outros",
    },
    summary: {
      one: "{count} arquivo classificado",
      other: "{count} arquivos classificados",
    },
    why: 'Por que .hidden é "Other"',
    explanation: [
      "Em Python 3.14, ",
      { code: "Path.suffix" },
      " trata um ponto inicial como parte do nome. Apenas a última extensão conta: ",
      { code: "archive.tar.gz" },
      " usa ",
      { code: ".gz" },
      ". Um ponto final é a extensão ",
      { code: "." },
      ", então ",
      { code: "image." },
      " fica em Other. Os espaços nos nomes são preservados. Os destinos são apenas prévias; nenhum arquivo é movido. Os nomes de categoria (Images, Documents, Archives e Other) são os valores usados pelo Sweep e por isso aparecem em inglês; a tradução entre parênteses é só uma ajuda de leitura.",
    ],
    noscript:
      "Os exemplos já estão calculados. Ative o JavaScript para testar outros nomes de arquivo.",
  },
} satisfies Record<LocaleId, ClassifierCopy>;

export const executionCopy = {
  en: {
    caption: "bench · simulated in this browser",
    newExample: "new example",
    lifecycleAria: "Execution lifecycle",
    lifecycle: {
      start: "start →",
      finish: "succeed / fail →",
      cancel: "cancel from queued or running →",
    },
    exitCodeLabel: "Exit code · succeed / fail",
    failureMessageLabel: "Failure message",
    defaultFailureMessage: "Example failure",
    operations: {
      start: "start",
      succeed: "succeed",
      fail: "fail",
      cancel: "cancel",
    },
    initialFeedback:
      "Sample execution. Try an operation, including one this state rejects.",
    availability: "Accepted now: {accepted}. Rejected now: {rejected}.",
    none: "none",
    solidHelp:
      "Solid buttons are accepted. Dotted buttons remain clickable to show the rejection.",
    stateBand: "State",
    clockHelp: "Times come from this browser’s clock.",
    historyBand: "History",
    messages: {
      created: "created → QUEUED",
      accepted: "{operation} accepted → {status}.",
      rejected: "{operation} rejected: {reason}. State remains {status}.",
      newExample:
        "New sample execution created in QUEUED. This is not a lifecycle transition.",
      historyAccepted: "accepted: {operation} → {status}",
      historyRejected: "rejected: {operation} from {status}: {reason}",
    },
    reasons: {
      "not-queued": "Only queued executions can be started",
      "not-running-succeed": "Only running executions can succeed",
      "not-running-fail": "Only running executions can fail",
      "blank-message": "Error message must not be blank",
      "not-cancellable": "Only queued or running executions can be cancelled",
      "exit-code-range":
        "Enter an integer exit code between -2147483648 and 2147483647 for this example",
    },
    rules: {
      caption: "Transition rules · Orbit cd97666",
      headers: ["action", "from", "to", "sets"],
      failSets: "finishedAt, exitCode, nonblank errorMessage",
    },
    noscript: "Enable JavaScript to try the lifecycle operations.",
  },
  "pt-BR": {
    caption: "bancada · simulado neste navegador",
    newExample: "novo exemplo",
    lifecycleAria: "Ciclo de vida da execução",
    lifecycle: {
      start: "iniciar →",
      finish: "concluir com sucesso / falhar →",
      cancel: "cancelar a partir de QUEUED ou RUNNING →",
    },
    exitCodeLabel: "Código de saída · sucesso / falha",
    failureMessageLabel: "Mensagem de falha",
    defaultFailureMessage: "Falha de exemplo",
    operations: {
      start: "iniciar",
      succeed: "concluir com sucesso",
      fail: "falhar",
      cancel: "cancelar",
    },
    initialFeedback:
      "Execução de exemplo. Teste uma operação, inclusive uma que este estado rejeita.",
    availability: "Aceitas agora: {accepted}. Rejeitadas agora: {rejected}.",
    none: "nenhuma",
    solidHelp:
      "Botões sólidos são aceitos. Botões pontilhados continuam clicáveis para mostrar a rejeição.",
    stateBand: "Estado",
    clockHelp: "Os horários vêm do relógio deste navegador.",
    historyBand: "Histórico",
    messages: {
      created: "criada → QUEUED",
      accepted: "Operação “{operation}” aceita → {status}.",
      rejected:
        "Operação “{operation}” rejeitada: {reason}. O estado continua {status}.",
      newExample:
        "Nova execução de exemplo criada em QUEUED. Isto não é uma transição do ciclo de vida.",
      historyAccepted: "aceita: {operation} → {status}",
      historyRejected: "rejeitada: {operation} a partir de {status}: {reason}",
    },
    reasons: {
      "not-queued": "Só execuções enfileiradas podem ser iniciadas",
      "not-running-succeed":
        "Só execuções em andamento podem ser concluídas com sucesso",
      "not-running-fail": "Só execuções em andamento podem falhar",
      "blank-message": "A mensagem de erro não pode estar em branco",
      "not-cancellable":
        "Só execuções enfileiradas ou em andamento podem ser canceladas",
      "exit-code-range":
        "Informe um código de saída inteiro entre -2147483648 e 2147483647 para este exemplo",
    },
    rules: {
      caption: "Regras de transição · Orbit cd97666",
      headers: ["ação", "de", "para", "define"],
      failSets: "finishedAt, exitCode, errorMessage não vazia",
    },
    noscript: "Ative o JavaScript para testar as operações do ciclo de vida.",
  },
} satisfies Record<LocaleId, ExecutionCopy>;

export const bootCopy = {
  en: {
    sectionNavAria: "Source section",
    progress: "{number} / {total} · {title}",
    rejectedPrevious: "rejected: no previous section · {number} / {total}",
    rejectedNext: "rejected: no next section · {number} / {total}",
    previous: "← previous",
    next: "next →",
    noteLabel: "Note",
    importantLabel: "Important",
    important:
      "The project’s learning notes record this output in QEMU. This page does not boot the source or reproduce that verification.",
    help: "Sections group the source by purpose, not file order. Source comments are omitted.",
    assemblyLink: "assembly ↗",
    resultTitle: "documented result · qemu",
    noscript:
      "The first section is visible. Read the complete assembly using the source link.",
  },
  "pt-BR": {
    sectionNavAria: "Seção do código-fonte",
    progress: "{number} / {total} · {title}",
    rejectedPrevious: "rejeitado: não há seção anterior · {number} / {total}",
    rejectedNext: "rejeitado: não há próxima seção · {number} / {total}",
    previous: "← anterior",
    next: "próxima →",
    noteLabel: "Nota",
    importantLabel: "Importante",
    important:
      "As anotações de aprendizado do projeto registram esta saída no QEMU. Esta página não faz o boot do código-fonte nem reproduz essa verificação.",
    help: "As seções agrupam o código-fonte por finalidade, não pela ordem do arquivo. Os comentários do código-fonte foram omitidos.",
    assemblyLink: "assembly ↗",
    resultTitle: "resultado documentado · qemu",
    noscript:
      "A primeira seção está visível. Leia o assembly completo pelo link do código-fonte.",
  },
} satisfies Record<LocaleId, BootCopy>;
