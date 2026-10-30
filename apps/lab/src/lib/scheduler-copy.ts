import type { LocaleId } from "../../../../site/locales.ts";
import type { PluralForms } from "./plural-core.ts";
import type {
  BackoffKind,
  Cell,
  ConfigIssue,
  EventKind,
  FailureKind,
  JobStatus,
  PresetId,
} from "./scheduler-sim.ts";

// Strings of the scheduler simulator, one complete catalog per registry locale.
// Like the other benches, the page renders its locale's strings at build time
// (`data-copy`) and the plain TypeScript script only fills `{placeholders}`.
// Identifiers the user sees as data (`job-1`, `error`, `hang`, `fixed`,
// `exponential`) are model vocabulary and stay in English on both pages.

export interface SchedulerCopy {
  caption: string;
  presetsBand: string;
  presetsAria: string;
  presets: Record<PresetId, { name: string; hint: string }>;
  configBand: string;
  concurrencyLabel: string;
  concurrencyHelp: string;
  jobLegend: string;
  fields: {
    duration: string;
    timeout: string;
    maxRetries: string;
    backoff: string;
    backoffBase: string;
    failAttempts: string;
    failureKind: string;
    submitAt: string;
  };
  fieldHelp: {
    duration: string;
    timeout: string;
    maxRetries: string;
    backoffBase: string;
    failAttempts: string;
    submitAt: string;
  };
  backoffOptions: Record<BackoffKind, string>;
  failureOptions: Record<FailureKind, string>;
  addJob: string;
  /** `{id}`. */
  removeJob: string;
  controlsBand: string;
  step: string;
  run: string;
  pause: string;
  reset: string;
  speedLabel: string;
  /** `{count}` ticks per second. */
  speedValue: PluralForms;
  reducedMotionNote: string;
  tickLabel: string;
  statusBand: string;
  statusHeaders: readonly [string, string, string, string, string];
  /** `{id}`. */
  cancel: string;
  cancelled: string;
  noAction: string;
  timelineBand: string;
  timelineCaption: string;
  timelineJob: string;
  /** Names shown in the legend; each cell carries its one-letter mark. */
  legend: Record<Cell, string>;
  marks: Record<Cell, string>;
  status: Record<JobStatus, string>;
  /** Detail column of the status table. `{tick}` and `{attempts}`. */
  detail: {
    idle: string;
    readyAt: string;
    runningSince: string;
    finishedAt: string;
    lastError: string;
    lastTimeout: string;
  };
  logBand: string;
  events: Record<EventKind, string>;
  retryNow: string;
  /** `{count}`. */
  retryIn: PluralForms;
  attempts: PluralForms;
  ticks: PluralForms;
  jobsCompleted: PluralForms;
  jobsFailed: PluralForms;
  jobsCancelled: PluralForms;
  messages: {
    ready: string;
    /** `{tick}`, `{running}`, `{pending}`, `{completed}`, `{failed}`. */
    progress: string;
    /** `{ticks}`, `{completed}`, `{failed}`, `{cancelled}`, `{utilization}`. */
    finished: string;
    /** `{ticks}`, `{running}`, `{pending}`. */
    halted: string;
    running: string;
    paused: string;
    reset: string;
    presetLoaded: string;
    jobAdded: string;
    jobRemoved: string;
    atLimit: string;
    lastJob: string;
    stepAfterEnd: string;
    cancelRejected: string;
    editedWhileRunning: string;
  };
  issues: Record<ConfigIssue, string>;
  conceptsHeading: string;
  concepts: readonly { term: string; text: string }[];
  limitsHeading: string;
  limits: readonly string[];
  noscript: string;
}

export const schedulerCopy = {
  en: {
    caption: "bench · simulated in this browser",
    presetsBand: "Scenarios",
    presetsAria: "Scenarios",
    presets: {
      queue: {
        name: "one slot",
        hint: "Three jobs, one slot. Watch the queue drain in submission order.",
      },
      concurrency: {
        name: "two slots",
        hint: "Five jobs share two slots. The finish time drops, but never below the longest job.",
      },
      retries: {
        name: "flaky job",
        hint: "job-1 fails twice, then succeeds on the third attempt because retries allow it.",
      },
      exponential: {
        name: "exponential backoff",
        hint: "The gaps before each retry double: 1, 2, 4, 8 ticks.",
      },
      timeout: {
        name: "timeout",
        hint: "The first attempt of job-1 hangs. The timeout stops it so job-2 can run.",
      },
      stall: {
        name: "no timeout",
        hint: "A hanging job with no timeout keeps its slot forever. job-2 never starts.",
      },
      exhausted: {
        name: "retries exhausted",
        hint: "job-1 fails more often than its retries cover and ends failed.",
      },
    },
    configBand: "Configuration",
    concurrencyLabel: "Concurrency · slots",
    concurrencyHelp:
      "How many jobs may run at once, 1 to 4. Ready jobs beyond that wait in the queue.",
    jobLegend: "Job",
    fields: {
      duration: "Duration · ticks",
      timeout: "Timeout · ticks",
      maxRetries: "Max retries",
      backoff: "Backoff",
      backoffBase: "Backoff base · ticks",
      failAttempts: "Failing attempts",
      failureKind: "Failure kind",
      submitAt: "Submit at · tick",
    },
    fieldHelp: {
      duration: "1 to 20",
      timeout: "0 means none, up to 30",
      maxRetries: "0 to 5, after the first attempt",
      backoffBase: "1 to 8",
      failAttempts: "How many first attempts fail, 0 to 6",
      submitAt: "0 to 30",
    },
    backoffOptions: {
      none: "none",
      fixed: "fixed",
      exponential: "exponential",
    },
    failureOptions: { error: "error", hang: "hang" },
    addJob: "add job",
    removeJob: "remove {id}",
    controlsBand: "Run",
    step: "step",
    run: "run",
    pause: "pause",
    reset: "reset",
    speedLabel: "Speed",
    speedValue: {
      one: "{count} tick per second",
      other: "{count} ticks per second",
    },
    reducedMotionNote:
      "Reduced motion is on: run jumps straight to the end instead of playing tick by tick. Step still advances one tick.",
    tickLabel: "Tick",
    statusBand: "Jobs",
    statusHeaders: ["job", "state", "attempts", "detail", "action"],
    cancel: "cancel {id}",
    cancelled: "cancelled",
    noAction: "—",
    timelineBand: "Timeline",
    timelineCaption: "What each job holds during each tick",
    timelineJob: "job",
    legend: {
      waiting: "waiting: not submitted yet or backing off before a retry",
      queued: "queued: ready, no free slot",
      running: "running: holds a slot",
      done: "completed",
      failed: "failed for good",
      cancelled: "cancelled",
    },
    marks: {
      waiting: "w",
      queued: "q",
      running: "R",
      done: "C",
      failed: "F",
      cancelled: "X",
    },
    status: {
      pending: "pending",
      running: "running",
      completed: "completed",
      failed: "failed",
      cancelled: "cancelled",
    },
    detail: {
      idle: "ready, waiting for a slot",
      readyAt: "not ready until tick {tick}",
      runningSince: "attempt {attempts}, started at tick {tick}",
      finishedAt: "finished at tick {tick}",
      lastError: "last attempt ended with an error",
      lastTimeout: "last attempt hit the timeout",
    },
    logBand: "Event log",
    events: {
      submitted: "tick {tick}: {job} submitted",
      started: "tick {tick}: {job} started attempt {attempt}",
      completed: "tick {tick}: {job} completed on attempt {attempt}",
      "attempt-failed":
        "tick {tick}: {job} attempt {attempt} failed with an error",
      "timed-out":
        "tick {tick}: {job} attempt {attempt} hit its timeout and was stopped",
      "retry-scheduled": "tick {tick}: {job} will retry {delay}",
      "gave-up": "tick {tick}: {job} failed for good after {attempts}",
      cancelled: "tick {tick}: {job} cancelled",
      halted: "tick {tick}: stopped at the tick limit",
    },
    retryNow: "immediately",
    retryIn: { one: "in {count} tick", other: "in {count} ticks" },
    attempts: { one: "{count} attempt", other: "{count} attempts" },
    ticks: { one: "{count} tick", other: "{count} ticks" },
    jobsCompleted: {
      one: "{count} job completed",
      other: "{count} jobs completed",
    },
    jobsFailed: { one: "{count} job failed", other: "{count} jobs failed" },
    jobsCancelled: {
      one: "{count} job cancelled",
      other: "{count} jobs cancelled",
    },
    messages: {
      ready: "Pick a scenario or edit the jobs, then step or run.",
      progress:
        "Tick {tick}: {running} running, {pending} pending, {completed} completed, {failed} failed.",
      finished:
        "Finished after {ticks}: {completed}, {failed}, {cancelled}. Slots were busy {utilization} of the time.",
      halted:
        "Stopped at the limit of {ticks}: {running} still running, {pending} still pending. Nothing more will happen.",
      running: "Running.",
      paused: "Paused.",
      reset: "Reset to tick 0 with the current configuration.",
      presetLoaded: "Scenario “{name}” loaded. {hint}",
      jobAdded: "{id} added.",
      jobRemoved: "{id} removed.",
      atLimit: "Eight jobs is the limit.",
      lastJob: "At least one job is needed.",
      stepAfterEnd: "The simulation is over. Reset to run it again.",
      cancelRejected: "{id} is already final and cannot be cancelled.",
      editedWhileRunning:
        "Configuration changed. The simulation was reset to tick 0.",
    },
    issues: {
      "no-jobs": "Add at least one job.",
      "too-many-jobs": "Use at most 8 jobs.",
      "concurrency-range": "Concurrency must be between 1 and 4.",
      "duplicate-id": "Two jobs share an identifier.",
      "duration-range": "Duration must be between 1 and 20 ticks.",
      "timeout-range": "Timeout must be between 0 and 30 ticks.",
      "retries-range": "Max retries must be between 0 and 5.",
      "backoff-range": "Backoff base must be between 1 and 8 ticks.",
      "failures-range": "Failing attempts must be between 0 and 6.",
      "submit-range": "Submit tick must be between 0 and 30.",
      "not-integer": "Use whole numbers only.",
    },
    conceptsHeading: "What to watch",
    concepts: [
      {
        term: "scheduling",
        text: "Deciding which ready job gets a free slot next. Here the rule is first ready, first served; ties go to the job listed first.",
      },
      {
        term: "queueing",
        text: "A job that is ready but has no slot is queued (q). Queues grow when work arrives faster than slots free up.",
      },
      {
        term: "concurrency",
        text: "More slots shorten the total time only while there is work to share. Two slots cannot finish five jobs faster than the longest one.",
      },
      {
        term: "retries",
        text: "A failed attempt can be tried again, up to max retries. The first attempt is not a retry, so 2 retries allow 3 attempts.",
      },
      {
        term: "backoff",
        text: "Waiting before a retry (w) gives a struggling dependency room to recover. Fixed waits the same time; exponential doubles it. Real systems often add random jitter; this model has none so every run repeats exactly.",
      },
      {
        term: "timeouts",
        text: "A timeout stops an attempt that has not finished. An attempt as long as the timeout still succeeds; one tick longer does not. Without a timeout a hung job holds its slot until you reset.",
      },
      {
        term: "failure handling",
        text: "An error ends the attempt, a hang never ends by itself. Either can be retried; once retries run out the job is failed for good and the queue moves on.",
      },
    ],
    limitsHeading: "Limits",
    limits: [
      "This is a teaching model with an integer clock. No real job runs, nothing is scheduled in the background and nothing is stored.",
      "It is not Orbit. Orbit’s Job records a maximum number of retries and an execution timeout, but its architecture notes list retries and workers as outside the initial scope, so there is no Orbit scheduler to mirror.",
      "Real schedulers add priorities, cron schedules, persistence, worker failure and clock drift. None are modeled here.",
      "The simulation stops after 120 ticks.",
    ],
    noscript:
      "The scenarios need JavaScript to run. Without it, this page only shows the controls.",
  },
  "pt-BR": {
    caption: "bancada · simulada neste navegador",
    presetsBand: "Cenários",
    presetsAria: "Cenários",
    presets: {
      queue: {
        name: "uma vaga",
        hint: "Três jobs, uma vaga. Veja a fila esvaziar na ordem de envio.",
      },
      concurrency: {
        name: "duas vagas",
        hint: "Cinco jobs dividem duas vagas. O tempo total cai, mas nunca abaixo do job mais longo.",
      },
      retries: {
        name: "job instável",
        hint: "O job-1 falha duas vezes e dá certo na terceira tentativa, porque os retries permitem.",
      },
      exponential: {
        name: "backoff exponencial",
        hint: "A espera antes de cada nova tentativa dobra: 1, 2, 4, 8 ticks.",
      },
      timeout: {
        name: "timeout",
        hint: "A primeira tentativa do job-1 trava. O timeout a interrompe para o job-2 poder rodar.",
      },
      stall: {
        name: "sem timeout",
        hint: "Um job travado sem timeout fica com a vaga para sempre. O job-2 nunca começa.",
      },
      exhausted: {
        name: "retries esgotados",
        hint: "O job-1 falha mais vezes do que os retries cobrem e termina como falho.",
      },
    },
    configBand: "Configuração",
    concurrencyLabel: "Concorrência · vagas",
    concurrencyHelp:
      "Quantos jobs podem rodar ao mesmo tempo, de 1 a 4. Os jobs prontos que passarem disso esperam na fila.",
    jobLegend: "Job",
    fields: {
      duration: "Duração · ticks",
      timeout: "Timeout · ticks",
      maxRetries: "Máximo de retries",
      backoff: "Backoff",
      backoffBase: "Base do backoff · ticks",
      failAttempts: "Tentativas com falha",
      failureKind: "Tipo de falha",
      submitAt: "Enviado no tick",
    },
    fieldHelp: {
      duration: "de 1 a 20",
      timeout: "0 significa nenhum, até 30",
      maxRetries: "de 0 a 5, depois da primeira tentativa",
      backoffBase: "de 1 a 8",
      failAttempts: "Quantas das primeiras tentativas falham, de 0 a 6",
      submitAt: "de 0 a 30",
    },
    backoffOptions: {
      none: "none",
      fixed: "fixed",
      exponential: "exponential",
    },
    failureOptions: { error: "error", hang: "hang" },
    addJob: "adicionar job",
    removeJob: "remover {id}",
    controlsBand: "Execução",
    step: "avançar",
    run: "executar",
    pause: "pausar",
    reset: "reiniciar",
    speedLabel: "Velocidade",
    speedValue: {
      one: "{count} tick por segundo",
      other: "{count} ticks por segundo",
    },
    reducedMotionNote:
      "O movimento reduzido está ativo: executar vai direto ao final, sem exibir tick a tick. Avançar continua andando um tick por vez.",
    tickLabel: "Tick",
    statusBand: "Jobs",
    statusHeaders: ["job", "estado", "tentativas", "detalhe", "ação"],
    cancel: "cancelar {id}",
    cancelled: "cancelado",
    noAction: "—",
    timelineBand: "Linha do tempo",
    timelineCaption: "O que cada job ocupa em cada tick",
    timelineJob: "job",
    legend: {
      waiting:
        "aguardando: ainda não enviado ou em backoff antes de uma nova tentativa",
      queued: "na fila: pronto, sem vaga livre",
      running: "executando: ocupa uma vaga",
      done: "concluído",
      failed: "falhou de vez",
      cancelled: "cancelado",
    },
    marks: {
      waiting: "a",
      queued: "f",
      running: "E",
      done: "C",
      failed: "F",
      cancelled: "X",
    },
    status: {
      pending: "pendente",
      running: "executando",
      completed: "concluído",
      failed: "falhou",
      cancelled: "cancelado",
    },
    detail: {
      idle: "pronto, esperando uma vaga",
      readyAt: "só fica pronto no tick {tick}",
      runningSince: "tentativa {attempts}, iniciada no tick {tick}",
      finishedAt: "terminou no tick {tick}",
      lastError: "a última tentativa terminou com erro",
      lastTimeout: "a última tentativa estourou o timeout",
    },
    logBand: "Registro de eventos",
    events: {
      submitted: "tick {tick}: {job} enviado",
      started: "tick {tick}: {job} iniciou a tentativa {attempt}",
      completed: "tick {tick}: {job} concluído na tentativa {attempt}",
      "attempt-failed":
        "tick {tick}: a tentativa {attempt} de {job} falhou com erro",
      "timed-out":
        "tick {tick}: a tentativa {attempt} de {job} estourou o timeout e foi interrompida",
      "retry-scheduled": "tick {tick}: {job} vai tentar de novo {delay}",
      "gave-up": "tick {tick}: {job} falhou de vez após {attempts}",
      cancelled: "tick {tick}: {job} cancelado",
      halted: "tick {tick}: parou no limite de ticks",
    },
    retryNow: "imediatamente",
    retryIn: { one: "em {count} tick", other: "em {count} ticks" },
    attempts: {
      one: "{count} tentativa",
      other: "{count} tentativas",
      none: "nenhuma tentativa",
    },
    ticks: { one: "{count} tick", other: "{count} ticks", none: "nenhum tick" },
    jobsCompleted: {
      one: "{count} job concluído",
      other: "{count} jobs concluídos",
      none: "nenhum job concluído",
    },
    jobsFailed: {
      one: "{count} job falhou",
      other: "{count} jobs falharam",
      none: "nenhum job falhou",
    },
    jobsCancelled: {
      one: "{count} job cancelado",
      other: "{count} jobs cancelados",
      none: "nenhum job cancelado",
    },
    messages: {
      ready: "Escolha um cenário ou edite os jobs e depois avance ou execute.",
      progress:
        "Tick {tick}: {running} executando, {pending} pendentes, {completed} concluídos, {failed} com falha.",
      finished:
        "Terminou após {ticks}: {completed}, {failed}, {cancelled}. As vagas ficaram ocupadas em {utilization} do tempo.",
      halted:
        "Parou no limite de {ticks}: {running} ainda executando, {pending} ainda pendentes. Nada mais vai acontecer.",
      running: "Executando.",
      paused: "Pausado.",
      reset: "Reiniciado no tick 0 com a configuração atual.",
      presetLoaded: "Cenário “{name}” carregado. {hint}",
      jobAdded: "{id} adicionado.",
      jobRemoved: "{id} removido.",
      atLimit: "O limite é de oito jobs.",
      lastJob: "É preciso ter ao menos um job.",
      stepAfterEnd: "A simulação terminou. Reinicie para executar de novo.",
      cancelRejected: "{id} já está em estado final e não pode ser cancelado.",
      editedWhileRunning: "A configuração mudou. A simulação voltou ao tick 0.",
    },
    issues: {
      "no-jobs": "Adicione ao menos um job.",
      "too-many-jobs": "Use no máximo 8 jobs.",
      "concurrency-range": "A concorrência deve ficar entre 1 e 4.",
      "duplicate-id": "Dois jobs têm o mesmo identificador.",
      "duration-range": "A duração deve ficar entre 1 e 20 ticks.",
      "timeout-range": "O timeout deve ficar entre 0 e 30 ticks.",
      "retries-range": "O máximo de retries deve ficar entre 0 e 5.",
      "backoff-range": "A base do backoff deve ficar entre 1 e 8 ticks.",
      "failures-range": "As tentativas com falha devem ficar entre 0 e 6.",
      "submit-range": "O tick de envio deve ficar entre 0 e 30.",
      "not-integer": "Use apenas números inteiros.",
    },
    conceptsHeading: "O que observar",
    concepts: [
      {
        term: "agendamento",
        text: "Decidir qual job pronto recebe a próxima vaga livre. Aqui a regra é o primeiro a ficar pronto ser o primeiro atendido; em empate, vale o job listado antes.",
      },
      {
        term: "fila",
        text: "Um job pronto sem vaga fica na fila (f). A fila cresce quando o trabalho chega mais rápido do que as vagas se liberam.",
      },
      {
        term: "concorrência",
        text: "Mais vagas encurtam o tempo total só enquanto há trabalho para dividir. Duas vagas não terminam cinco jobs antes do mais longo deles.",
      },
      {
        term: "retries",
        text: "Uma tentativa que falhou pode ser repetida, até o máximo de retries. A primeira tentativa não conta como retry, então 2 retries permitem 3 tentativas.",
      },
      {
        term: "backoff",
        text: "Esperar antes de tentar de novo (a) dá tempo para uma dependência em dificuldade se recuperar. O fixed espera sempre o mesmo tempo; o exponential dobra. Sistemas reais costumam somar um jitter aleatório; este modelo não tem, para que toda execução se repita igual.",
      },
      {
        term: "timeouts",
        text: "O timeout interrompe uma tentativa que não terminou. Uma tentativa com a mesma duração do timeout ainda dá certo; com um tick a mais, não. Sem timeout, um job travado fica com a vaga até você reiniciar.",
      },
      {
        term: "tratamento de falhas",
        text: "Um erro encerra a tentativa; um hang nunca termina sozinho. Os dois podem ser repetidos; quando os retries acabam, o job falha de vez e a fila segue.",
      },
    ],
    limitsHeading: "Limites",
    limits: [
      "É um modelo didático com relógio de números inteiros. Nenhum job real roda, nada é agendado em segundo plano e nada é guardado.",
      "Não é o Orbit. O Job do Orbit registra um máximo de retries e um timeout de execução, mas as notas de arquitetura dele deixam retries e workers fora do escopo inicial; não existe um agendador do Orbit para espelhar.",
      "Agendadores reais têm prioridades, agendas cron, persistência, falha de workers e deriva de relógio. Nada disso é modelado aqui.",
      "A simulação para depois de 120 ticks.",
    ],
    noscript:
      "Os cenários precisam de JavaScript para rodar. Sem ele, esta página mostra apenas os controles.",
  },
} satisfies Record<LocaleId, SchedulerCopy>;
