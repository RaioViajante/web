# Scheduler simulator (004)

A teaching model of a job scheduler. It is not Orbit and says so on the page.

## Provenance

Orbit revision `2967494` defines a Job with a maximum number of retries and an
execution timeout, but its architecture notes list retries and distributed
workers as outside the initial scope. Nothing in this experiment reproduces an
Orbit behavior; the revision is pinned only for the job settings that inspired
the controls. Fidelity is therefore `simulated`, and the notes and the Fidelity
rows state the gap.

## Model

`src/lib/scheduler-sim.ts` is pure and has no clock, randomness or I/O.

- Time is an integer tick. `step` settles running jobs, starts ready jobs in
  first-ready order (ties by listing order), then records what each job holds
  during `[t, t+1)`. A slot freed in a tick is reused in the same tick.
- States: `pending`, `running`, `completed`, `failed`, `cancelled`. A pending
  job with `readyAt > now` is shown as waiting (not submitted or backing off).
  The legal transitions are in `allowedTransitions`; `move` throws on any other.
- A job fails its first `failAttempts` attempts, either by `error` (after its
  duration) or `hang` (never ends alone). `timeout` 0 means none.
- Timeout boundary: an attempt as long as its timeout succeeds; one tick longer
  times out. A hang without a timeout holds its slot until the 120-tick limit.
- Backoff: `none`, `fixed`, `exponential` (base × 2^(retry−1)), capped at 64
  ticks. There is no jitter, so every run repeats exactly.
- Limits (`LIMITS`): 8 jobs, 4 slots, duration 20, timeout 30, 5 retries, 6
  failing attempts, submit tick 30, 120 ticks. Invalid configurations are
  refused with a named issue, never clamped silently.

## Page

`SchedulerBench.tsx` renders the controls at build time; the plain TypeScript
script in `SchedulerSimulator.astro` reads the inputs, runs the model and
renders the timeline, the job table and the log. Editing any input resets to
tick 0. With `prefers-reduced-motion`, run jumps to the end and the speed slider
is disabled; step still moves one tick. The auto-run timer is a single
`setTimeout` chain cleared on pause, reset, edit and `pagehide`.

Counted phrases (`tick(s)`, `job(s) completed`, retry delays) are rendered at
build time into a table (`scheduler-count.ts`) so the script does not import the
plural rules; the table is checked against `countedFor` in
`tests/scheduler-copy.test.mjs`. The script's stylesheet is imported by the
script, which Astro hoists to every experiment page (about 1 KB compressed).

## Tests

`tests/scheduler-sim.test.mjs` (invariants, retries, backoff, timeouts,
cancellation, determinism, limits) and `tests/scheduler-copy.test.mjs` (EN/PT
parity, placeholders, plurals, numeric formatting, event wording).
