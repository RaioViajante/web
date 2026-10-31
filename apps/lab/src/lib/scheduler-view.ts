import { fill } from "./template.ts";
import type { SchedulerCopy } from "./scheduler-copy.ts";
import {
  summarize,
  type Cell,
  type JobState,
  type SimEvent,
  type SimState,
} from "./scheduler-sim.ts";

/** The counted phrases of the catalog, each rendered for a whole number of items. */
export type CountedPhrase =
  | "retryIn"
  | "attempts"
  | "ticks"
  | "jobsCompleted"
  | "jobsFailed"
  | "jobsCancelled"
  | "speedValue";

/** Renders `phrase` for `count`; the server and the tests use `countedFor`, the page a table. */
export type Counter = (phrase: CountedPhrase, count: number) => string;

export type CountTable = Record<CountedPhrase, string[]>;

/** The largest count each phrase is ever asked for, which bounds the page's table. */
export const countLimits: Record<CountedPhrase, number> = {
  retryIn: 64,
  attempts: 8,
  ticks: 121,
  jobsCompleted: 8,
  jobsFailed: 8,
  jobsCancelled: 8,
  speedValue: 16,
};

export function tableCounter(table: CountTable): Counter {
  return (phrase, count) => {
    const text = table[phrase][count];
    if (text === undefined)
      throw new RangeError(`No ${phrase} wording for ${count}`);
    return text;
  };
}

// Everything the browser script shows as text, as pure functions of the state
// and the locale's catalog, so the Node tests can check the wording.

/** Cells that mean "this job is over" print their mark only once, on the tick it ended. */
const FINAL_CELLS: ReadonlySet<Cell> = new Set(["done", "failed", "cancelled"]);

export function cellMark(
  copy: SchedulerCopy,
  row: readonly Cell[],
  tick: number,
): string {
  const cell = row[tick]!;
  if (FINAL_CELLS.has(cell) && row[tick - 1] === cell) return "";
  return copy.marks[cell];
}

export function eventText(
  copy: SchedulerCopy,
  count: Counter,
  event: SimEvent,
): string {
  const delay =
    event.delay === 0 ? copy.retryNow : count("retryIn", event.delay);
  return fill(copy.events[event.kind], {
    tick: event.tick,
    job: event.jobId ?? "",
    attempt: event.attempt,
    attempts: count("attempts", event.attempt),
    delay,
  });
}

export function percent(intlLocale: string, whole: number): string {
  return new Intl.NumberFormat(intlLocale, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(whole / 100);
}

/** The sentence for the live region after a tick or a run. */
export function progressText(
  copy: SchedulerCopy,
  intlLocale: string,
  count: Counter,
  state: SimState,
): string {
  const s = summarize(state);
  if (state.halted)
    return fill(copy.messages.halted, {
      ticks: count("ticks", s.now),
      running: s.running,
      pending: s.pending,
    });
  if (s.pending === 0 && s.running === 0)
    return fill(copy.messages.finished, {
      ticks: count("ticks", s.elapsed),
      completed: count("jobsCompleted", s.completed),
      failed: count("jobsFailed", s.failed),
      cancelled: count("jobsCancelled", s.cancelled),
      utilization: percent(intlLocale, s.utilization),
    });
  return fill(copy.messages.progress, {
    tick: s.now,
    running: s.running,
    pending: s.pending,
    completed: s.completed,
    failed: s.failed,
  });
}

/** The "detail" column of the job table; `now` is the tick the simulation will process next. */
export function detailText(
  copy: SchedulerCopy,
  job: JobState,
  now: number,
): string {
  switch (job.status) {
    case "pending":
      return job.readyAt > now
        ? fill(copy.detail.readyAt, { tick: job.readyAt })
        : copy.detail.idle;
    case "running":
      return fill(copy.detail.runningSince, {
        attempts: job.attempts,
        tick: job.startedAt,
      });
    default: {
      const finished = fill(copy.detail.finishedAt, { tick: job.finishedAt });
      if (job.lastFailure === "error")
        return `${finished} · ${copy.detail.lastError}`;
      if (job.lastFailure === "timeout")
        return `${finished} · ${copy.detail.lastTimeout}`;
      return finished;
    }
  }
}
