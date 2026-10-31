// A deterministic, discrete-time job scheduler simulation. It is an educational
// model, not Orbit: there is no wall clock, no randomness and no I/O. Time is an
// integer tick that only `step` advances, so a configuration always produces the
// same trace.
//
// Semantics of one tick `t` (see `step`):
//   1. Running jobs are settled. An attempt that has used its duration ends; one
//      that has used its whole timeout without ending is timed out.
//   2. Ready pending jobs (`readyAt <= t`) start in FIFO order of readiness, as
//      long as a slot is free. A slot freed in step 1 can be reused in step 2.
//   3. The state each job holds during the interval [t, t+1) is recorded.
// A job that starts at tick `s` with duration `d` therefore occupies ticks
// `s .. s+d-1` and ends at tick `s+d`.

export type JobStatus =
  "pending" | "running" | "completed" | "failed" | "cancelled";

export type FailureKind = "error" | "hang";
export type BackoffKind = "none" | "fixed" | "exponential";

/** What a job holds during one tick; `waiting` is a pending job that is not ready yet. */
export type Cell =
  "waiting" | "queued" | "running" | "done" | "failed" | "cancelled";

export interface JobConfig {
  /** Unique identifier shown to the user, for example `job-1`. */
  id: string;
  /** Ticks an attempt needs to finish when it does not hang. */
  duration: number;
  /** Ticks after which a running attempt is stopped; 0 means no timeout. */
  timeout: number;
  /** Retries after the first attempt. */
  maxRetries: number;
  backoff: BackoffKind;
  /** Base delay in ticks for `fixed` and `exponential` backoff. */
  backoffBase: number;
  /** How many leading attempts fail. */
  failAttempts: number;
  /** `error` ends the attempt in failure after its duration; `hang` never ends by itself. */
  failureKind: FailureKind;
  /** Tick at which the job is submitted. */
  submitAt: number;
}

export interface SimConfig {
  concurrency: number;
  jobs: readonly JobConfig[];
}

export type EventKind =
  | "submitted"
  | "started"
  | "completed"
  | "attempt-failed"
  | "timed-out"
  | "retry-scheduled"
  | "gave-up"
  | "cancelled"
  | "halted";

export interface SimEvent {
  tick: number;
  kind: EventKind;
  jobId: string | null;
  /** Attempt number the event belongs to (1-based), or 0 when not applicable. */
  attempt: number;
  /** Retry delay for `retry-scheduled`, in ticks. */
  delay: number;
}

export interface JobState {
  config: JobConfig;
  status: JobStatus;
  /** Attempts started so far. */
  attempts: number;
  /** Tick from which a pending job may start. */
  readyAt: number;
  /** Tick at which the current attempt started, or -1. */
  startedAt: number;
  /** Tick at which the job reached a final state, or -1. */
  finishedAt: number;
  /** Why the last attempt ended badly, if it did. */
  lastFailure: "error" | "timeout" | null;
}

export interface SimState {
  config: SimConfig;
  now: number;
  jobs: readonly JobState[];
  /** `trace[i][t]` is what job `i` held during tick `t`. */
  trace: readonly (readonly Cell[])[];
  events: readonly SimEvent[];
  /** True when the tick limit stopped a run that still had unfinished jobs. */
  halted: boolean;
}

export const LIMITS = {
  maxJobs: 8,
  maxConcurrency: 4,
  maxDuration: 20,
  maxTimeout: 30,
  maxRetries: 5,
  maxBackoffBase: 8,
  maxFailAttempts: 6,
  maxSubmitAt: 30,
  /** Backoff delays never exceed this many ticks. */
  maxDelay: 64,
  /** A simulation stops after this many ticks, finished or not. */
  maxTicks: 120,
} as const;

const FINAL: ReadonlySet<JobStatus> = new Set([
  "completed",
  "failed",
  "cancelled",
]);

export function isFinal(status: JobStatus): boolean {
  return FINAL.has(status);
}

/** Every transition the model can make; anything else is a bug. */
export const allowedTransitions: Readonly<
  Record<JobStatus, readonly JobStatus[]>
> = {
  pending: ["running", "cancelled"],
  running: ["completed", "pending", "failed", "cancelled"],
  completed: [],
  failed: [],
  cancelled: [],
};

export type ConfigIssue =
  | "no-jobs"
  | "too-many-jobs"
  | "concurrency-range"
  | "duplicate-id"
  | "duration-range"
  | "timeout-range"
  | "retries-range"
  | "backoff-range"
  | "failures-range"
  | "submit-range"
  | "not-integer"
  | "unknown-option";

export interface IssueAt {
  issue: ConfigIssue;
  /** Index of the offending job, or -1 for the configuration itself. */
  job: number;
}

const whole = (value: number) => Number.isInteger(value);
const within = (value: number, min: number, max: number) =>
  whole(value) && value >= min && value <= max;

/** Lists every reason the configuration cannot be simulated; empty means valid. */
export function validateConfig(config: SimConfig): IssueAt[] {
  const issues: IssueAt[] = [];
  const add = (issue: ConfigIssue, job = -1) => issues.push({ issue, job });
  if (!whole(config.concurrency)) add("not-integer");
  else if (!within(config.concurrency, 1, LIMITS.maxConcurrency))
    add("concurrency-range");
  if (config.jobs.length === 0) add("no-jobs");
  if (config.jobs.length > LIMITS.maxJobs) add("too-many-jobs");
  const seen = new Set<string>();
  config.jobs.forEach((job, index) => {
    if (!["none", "fixed", "exponential"].includes(job.backoff))
      add("unknown-option", index);
    if (!["error", "hang"].includes(job.failureKind))
      add("unknown-option", index);
    if (seen.has(job.id)) add("duplicate-id", index);
    seen.add(job.id);
    const numbers = [
      job.duration,
      job.timeout,
      job.maxRetries,
      job.backoffBase,
      job.failAttempts,
      job.submitAt,
    ];
    if (!numbers.every(whole)) return add("not-integer", index);
    if (!within(job.duration, 1, LIMITS.maxDuration))
      add("duration-range", index);
    if (!within(job.timeout, 0, LIMITS.maxTimeout)) add("timeout-range", index);
    if (!within(job.maxRetries, 0, LIMITS.maxRetries))
      add("retries-range", index);
    if (!within(job.backoffBase, 1, LIMITS.maxBackoffBase))
      add("backoff-range", index);
    if (!within(job.failAttempts, 0, LIMITS.maxFailAttempts))
      add("failures-range", index);
    if (!within(job.submitAt, 0, LIMITS.maxSubmitAt))
      add("submit-range", index);
  });
  return issues;
}

/** Delay in ticks before retry number `retry` (1 is the first retry). */
export function retryDelay(
  job: Pick<JobConfig, "backoff" | "backoffBase">,
  retry: number,
): number {
  if (!Number.isInteger(retry) || retry < 1)
    throw new RangeError("retry starts at 1");
  if (job.backoff === "none") return 0;
  if (job.backoff === "fixed")
    return Math.min(job.backoffBase, LIMITS.maxDelay);
  // Cap the exponent before shifting so a huge retry number cannot overflow.
  return Math.min(
    job.backoffBase * 2 ** Math.min(retry - 1, 10),
    LIMITS.maxDelay,
  );
}

export function createSimulation(config: SimConfig): SimState {
  const issues = validateConfig(config);
  if (issues.length > 0)
    throw new RangeError(`Invalid configuration: ${issues[0]!.issue}`);
  const jobs: JobState[] = config.jobs.map((job) => ({
    config: job,
    status: "pending",
    attempts: 0,
    readyAt: job.submitAt,
    startedAt: -1,
    finishedAt: -1,
    lastFailure: null,
  }));
  return {
    config,
    now: 0,
    jobs,
    trace: jobs.map(() => []),
    events: [],
    halted: false,
  };
}

/** True when every job reached a final state. */
export function isFinished(state: SimState): boolean {
  return state.jobs.every((job) => isFinal(job.status));
}

/** True when the simulation cannot advance any further. */
export function isOver(state: SimState): boolean {
  return state.halted || isFinished(state);
}

export function runningCount(state: SimState): number {
  return state.jobs.filter((job) => job.status === "running").length;
}

function cellOf(job: JobState, now: number): Cell {
  switch (job.status) {
    case "pending":
      return job.readyAt > now ? "waiting" : "queued";
    case "running":
      return "running";
    case "completed":
      return "done";
    case "failed":
      return "failed";
    case "cancelled":
      return "cancelled";
  }
}

function move(job: JobState, to: JobStatus): void {
  if (!allowedTransitions[job.status].includes(to))
    throw new Error(
      `Illegal transition ${job.status} -> ${to} for ${job.config.id}`,
    );
  job.status = to;
}

/**
 * Advances the simulation by one tick and returns the new state. The input is
 * never modified. Stepping a finished or halted simulation returns it unchanged.
 */
export function step(state: SimState): SimState {
  if (isOver(state)) return state;
  const now = state.now;
  const jobs: JobState[] = state.jobs.map((job) => ({ ...job }));
  const events: SimEvent[] = [...state.events];
  const emit = (
    kind: EventKind,
    job: JobState | null,
    attempt = 0,
    delay = 0,
  ) =>
    events.push({
      tick: now,
      kind,
      jobId: job?.config.id ?? null,
      attempt,
      delay,
    });

  for (const job of jobs)
    if (job.config.submitAt === now && job.status === "pending")
      emit("submitted", job);

  // 1. Settle running jobs, in configuration order.
  for (const job of jobs) {
    if (job.status !== "running") continue;
    const { duration, timeout, failureKind, maxRetries, failAttempts } =
      job.config;
    const used = now - job.startedAt;
    const hangs = failureKind === "hang" && job.attempts <= failAttempts;
    const needs = hangs ? Infinity : duration;
    let ended: "ok" | "error" | "timeout" | null = null;
    // The timeout wins only if the attempt is still unfinished when it expires.
    if (timeout > 0 && used >= timeout && needs > timeout) ended = "timeout";
    else if (used >= needs)
      ended = job.attempts <= failAttempts ? "error" : "ok";
    if (ended === null) continue;
    if (ended === "ok") {
      move(job, "completed");
      job.finishedAt = now;
      job.lastFailure = null;
      emit("completed", job, job.attempts);
      continue;
    }
    job.lastFailure = ended;
    emit(
      ended === "timeout" ? "timed-out" : "attempt-failed",
      job,
      job.attempts,
    );
    if (job.attempts <= maxRetries) {
      const delay = retryDelay(job.config, job.attempts);
      move(job, "pending");
      job.readyAt = now + delay;
      job.startedAt = -1;
      emit("retry-scheduled", job, job.attempts, delay);
    } else {
      move(job, "failed");
      job.finishedAt = now;
      emit("gave-up", job, job.attempts);
    }
  }

  // 2. Start ready jobs, oldest readiness first, ties by configuration order.
  let free =
    state.config.concurrency -
    jobs.filter((job) => job.status === "running").length;
  const ready = jobs
    .map((job, index) => ({ job, index }))
    .filter(({ job }) => job.status === "pending" && job.readyAt <= now)
    .sort((a, b) => a.job.readyAt - b.job.readyAt || a.index - b.index);
  for (const { job } of ready) {
    if (free <= 0) break;
    move(job, "running");
    job.attempts += 1;
    job.startedAt = now;
    free -= 1;
    emit("started", job, job.attempts);
  }

  // 3. Record this tick.
  const trace = state.trace.map((row, index) => [
    ...row,
    cellOf(jobs[index]!, now),
  ]);
  const next: SimState = {
    config: state.config,
    now: now + 1,
    jobs,
    trace,
    events,
    halted: false,
  };
  if (!isFinished(next) && next.now >= LIMITS.maxTicks) {
    return {
      ...next,
      halted: true,
      events: [
        ...events,
        { tick: next.now, kind: "halted", jobId: null, attempt: 0, delay: 0 },
      ],
    };
  }
  return next;
}

/** Steps until the simulation finishes or reaches the tick limit. */
export function run(state: SimState): SimState {
  let current = state;
  // `maxTicks` bounds the loop even if `step` were to stop making progress.
  for (let i = 0; i <= LIMITS.maxTicks && !isOver(current); i += 1)
    current = step(current);
  return current;
}

/**
 * Cancels a job that has not finished. A running job frees its slot at once,
 * which a queued job can use on the next tick. Returns the state unchanged for
 * an unknown or already final job.
 */
export function cancel(state: SimState, jobId: string): SimState {
  const index = state.jobs.findIndex((job) => job.config.id === jobId);
  const target = state.jobs[index];
  if (!target || isFinal(target.status)) return state;
  const jobs = state.jobs.map((job) => ({ ...job }));
  const job = jobs[index]!;
  move(job, "cancelled");
  job.finishedAt = state.now;
  const event: SimEvent = {
    tick: state.now,
    kind: "cancelled",
    jobId,
    attempt: job.attempts,
    delay: 0,
  };
  return { ...state, jobs, events: [...state.events, event] };
}

export interface Summary {
  now: number;
  /** Ticks from the start until the last job ended; the tick being processed when unfinished. */
  elapsed: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  /** Busy slot-ticks divided by slots × elapsed ticks, as a whole percentage. */
  utilization: number;
}

export function summarize(state: SimState): Summary {
  const count = (status: JobStatus) =>
    state.jobs.filter((job) => job.status === status).length;
  const finished = state.jobs
    .map((job) => job.finishedAt)
    .filter((tick) => tick >= 0);
  const elapsed =
    isFinished(state) && finished.length > 0
      ? Math.max(...finished)
      : state.now;
  const busy = state.trace.reduce(
    (sum, row) => sum + row.filter((cell) => cell === "running").length,
    0,
  );
  const capacity = elapsed * state.config.concurrency;
  return {
    now: state.now,
    elapsed,
    pending: count("pending"),
    running: count("running"),
    completed: count("completed"),
    failed: count("failed"),
    cancelled: count("cancelled"),
    utilization: capacity === 0 ? 0 : Math.round((busy / capacity) * 100),
  };
}

const defaults: Omit<JobConfig, "id"> = {
  duration: 3,
  timeout: 0,
  maxRetries: 0,
  backoff: "none",
  backoffBase: 2,
  failAttempts: 0,
  failureKind: "error",
  submitAt: 0,
};

export function makeJob(
  id: string,
  overrides: Partial<Omit<JobConfig, "id">> = {},
): JobConfig {
  return { id, ...defaults, ...overrides };
}

export type PresetId =
  | "queue"
  | "concurrency"
  | "retries"
  | "exponential"
  | "timeout"
  | "stall"
  | "exhausted";

export interface Preset {
  id: PresetId;
  config: SimConfig;
}

/** The scenarios offered to the user; their wording lives in the copy catalog. */
export const presets: readonly Preset[] = [
  {
    id: "queue",
    config: {
      concurrency: 1,
      jobs: [
        makeJob("job-1", { duration: 3 }),
        makeJob("job-2", { duration: 2 }),
        makeJob("job-3", { duration: 4 }),
      ],
    },
  },
  {
    id: "concurrency",
    config: {
      concurrency: 2,
      jobs: [4, 2, 3, 2, 5].map((duration, index) =>
        makeJob(`job-${index + 1}`, { duration }),
      ),
    },
  },
  {
    id: "retries",
    config: {
      concurrency: 2,
      jobs: [
        makeJob("job-1", {
          duration: 2,
          failAttempts: 2,
          maxRetries: 3,
          backoff: "fixed",
          backoffBase: 2,
        }),
        makeJob("job-2", { duration: 3 }),
      ],
    },
  },
  {
    id: "exponential",
    config: {
      concurrency: 1,
      jobs: [
        makeJob("job-1", {
          duration: 1,
          failAttempts: 4,
          maxRetries: 4,
          backoff: "exponential",
          backoffBase: 1,
        }),
      ],
    },
  },
  {
    id: "timeout",
    config: {
      concurrency: 1,
      jobs: [
        makeJob("job-1", {
          duration: 3,
          timeout: 4,
          failAttempts: 1,
          failureKind: "hang",
          maxRetries: 2,
          backoff: "fixed",
          backoffBase: 1,
        }),
        makeJob("job-2", { duration: 2 }),
      ],
    },
  },
  {
    id: "stall",
    config: {
      concurrency: 1,
      jobs: [
        makeJob("job-1", {
          duration: 2,
          failAttempts: 1,
          failureKind: "hang",
          timeout: 0,
        }),
        makeJob("job-2", { duration: 2 }),
      ],
    },
  },
  {
    id: "exhausted",
    config: {
      concurrency: 2,
      jobs: [
        makeJob("job-1", {
          duration: 2,
          failAttempts: 6,
          maxRetries: 2,
          backoff: "fixed",
          backoffBase: 1,
        }),
        makeJob("job-2", { duration: 4 }),
      ],
    },
  },
];

export function preset(id: PresetId): Preset {
  const found = presets.find((item) => item.id === id);
  if (!found) throw new RangeError(`Unknown preset ${id}`);
  return found;
}
