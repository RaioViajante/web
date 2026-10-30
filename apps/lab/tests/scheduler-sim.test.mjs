import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LIMITS,
  allowedTransitions,
  cancel,
  createSimulation,
  isFinished,
  isOver,
  makeJob,
  preset,
  presets,
  retryDelay,
  run,
  runningCount,
  step,
  summarize,
  validateConfig,
} from "../src/lib/scheduler-sim.ts";

const sim = (concurrency, ...jobs) => createSimulation({ concurrency, jobs });
const job = (state, id) => state.jobs.find((item) => item.config.id === id);
const events = (state, kind, id) =>
  state.events.filter(
    (e) => e.kind === kind && (id === undefined || e.jobId === id),
  );

test("concurrency is never exceeded and every job eventually finishes", () => {
  for (const concurrency of [1, 2, 3, 4]) {
    let state = sim(
      concurrency,
      ...[3, 1, 4, 1, 5, 2].map((duration, i) =>
        makeJob(`job-${i + 1}`, { duration }),
      ),
    );
    while (!isOver(state)) {
      state = step(state);
      assert.ok(runningCount(state) <= concurrency);
    }
    assert.ok(isFinished(state));
    assert.ok(state.jobs.every((j) => j.status === "completed"));
  }
});

test("jobs start in FIFO order and a freed slot is reused in the same tick", () => {
  const state = run(
    sim(
      1,
      makeJob("job-1", { duration: 2 }),
      makeJob("job-2", { duration: 2 }),
    ),
  );
  assert.equal(job(state, "job-1").finishedAt, 2);
  assert.equal(events(state, "started", "job-2")[0].tick, 2);
  assert.equal(job(state, "job-2").finishedAt, 4);
});

test("a job waits for its submit tick", () => {
  let state = sim(2, makeJob("late", { submitAt: 3, duration: 1 }));
  state = step(step(step(state)));
  assert.equal(job(state, "late").status, "pending");
  assert.deepEqual(state.trace[0], ["waiting", "waiting", "waiting"]);
  state = step(state);
  assert.equal(job(state, "late").status, "running");
  assert.equal(events(state, "started")[0].tick, 3);
});

test("every transition the run makes is allowed", () => {
  for (const { config } of presets) {
    let state = createSimulation(config);
    let previous = state.jobs.map((j) => j.status);
    while (!isOver(state)) {
      state = step(state);
      state.jobs.forEach((j, i) => {
        const before = previous[i];
        // Several transitions can happen inside one tick, but a final state never changes.
        if (["completed", "failed", "cancelled"].includes(before))
          assert.equal(j.status, before);
        else
          assert.ok(
            j.status === before || allowedTransitions[before].length > 0,
          );
      });
      previous = state.jobs.map((j) => j.status);
    }
  }
  assert.deepEqual(allowedTransitions.completed, []);
  assert.deepEqual(allowedTransitions.failed, []);
});

test("retries stop at maxRetries and the job then fails", () => {
  const state = run(
    sim(
      1,
      makeJob("job-1", {
        duration: 1,
        failAttempts: 6,
        maxRetries: 2,
        backoff: "fixed",
        backoffBase: 1,
      }),
    ),
  );
  const result = job(state, "job-1");
  assert.equal(result.status, "failed");
  assert.equal(result.attempts, 3);
  assert.equal(events(state, "retry-scheduled").length, 2);
  assert.equal(events(state, "gave-up").length, 1);
});

test("a job that fails fewer times than its retries completes", () => {
  const state = run(
    sim(
      1,
      makeJob("job-1", {
        duration: 2,
        failAttempts: 2,
        maxRetries: 3,
        backoff: "none",
      }),
    ),
  );
  assert.equal(job(state, "job-1").status, "completed");
  assert.equal(job(state, "job-1").attempts, 3);
});

test("zero retries means the first failure is final", () => {
  const state = run(sim(1, makeJob("job-1", { failAttempts: 1 })));
  assert.equal(job(state, "job-1").status, "failed");
  assert.equal(job(state, "job-1").attempts, 1);
});

test("backoff delays: none, fixed, exponential and the cap", () => {
  const delays = (backoff, base, n) =>
    Array.from({ length: n }, (_, i) =>
      retryDelay({ backoff, backoffBase: base }, i + 1),
    );
  assert.deepEqual(delays("none", 3, 3), [0, 0, 0]);
  assert.deepEqual(delays("fixed", 3, 3), [3, 3, 3]);
  assert.deepEqual(delays("exponential", 1, 5), [1, 2, 4, 8, 16]);
  assert.equal(
    retryDelay({ backoff: "exponential", backoffBase: 8 }, 5),
    LIMITS.maxDelay,
  );
  assert.equal(
    retryDelay({ backoff: "exponential", backoffBase: 8 }, 10_000),
    LIMITS.maxDelay,
  );
  assert.throws(
    () => retryDelay({ backoff: "fixed", backoffBase: 1 }, 0),
    RangeError,
  );
});

test("the retry is scheduled after the configured delay", () => {
  const state = run(
    sim(
      1,
      makeJob("job-1", {
        duration: 1,
        failAttempts: 1,
        maxRetries: 1,
        backoff: "fixed",
        backoffBase: 3,
      }),
    ),
  );
  const failedAt = events(state, "attempt-failed")[0].tick;
  const restartedAt = events(state, "started").at(-1).tick;
  assert.equal(restartedAt - failedAt, 3);
  assert.equal(events(state, "retry-scheduled")[0].delay, 3);
  // While it waits, the job is shown as waiting, not queued.
  assert.deepEqual(state.trace[0].slice(failedAt, restartedAt), [
    "waiting",
    "waiting",
    "waiting",
  ]);
});

test("timeout boundary: duration equal to the timeout succeeds, one more times out", () => {
  const equal = run(sim(1, makeJob("job-1", { duration: 4, timeout: 4 })));
  assert.equal(job(equal, "job-1").status, "completed");
  assert.equal(events(equal, "timed-out").length, 0);

  const over = run(sim(1, makeJob("job-1", { duration: 5, timeout: 4 })));
  assert.equal(job(over, "job-1").status, "failed");
  assert.equal(events(over, "timed-out")[0].tick, 4);
  assert.equal(job(over, "job-1").lastFailure, "timeout");
});

test("a hanging attempt is stopped by the timeout and the retry succeeds", () => {
  const state = run(
    sim(
      1,
      makeJob("job-1", {
        duration: 2,
        timeout: 3,
        failureKind: "hang",
        failAttempts: 1,
        maxRetries: 1,
        backoff: "none",
      }),
    ),
  );
  assert.equal(events(state, "timed-out")[0].tick, 3);
  assert.equal(job(state, "job-1").status, "completed");
});

test("without a timeout a hanging job holds its slot until the tick limit", () => {
  const state = run(
    sim(
      1,
      makeJob("job-1", { failureKind: "hang", failAttempts: 1 }),
      makeJob("job-2"),
    ),
  );
  assert.ok(state.halted);
  assert.equal(state.now, LIMITS.maxTicks);
  assert.equal(job(state, "job-1").status, "running");
  assert.equal(job(state, "job-2").status, "pending");
  assert.equal(events(state, "halted").length, 1);
  assert.equal(step(state), state, "a halted simulation does not advance");
});

test("the same configuration always gives the same trace", () => {
  for (const { config } of presets) {
    const a = run(createSimulation(config));
    const b = run(createSimulation(config));
    assert.deepEqual(a, b);
  }
});

test("step never modifies its input", () => {
  const before = sim(1, makeJob("job-1", { failAttempts: 1, maxRetries: 1 }));
  const snapshot = structuredClone(before);
  step(step(before));
  assert.deepEqual(before, snapshot);
});

test("cancelling frees the slot at once for the next job", () => {
  let state = step(
    sim(
      1,
      makeJob("job-1", { duration: 9 }),
      makeJob("job-2", { duration: 1 }),
    ),
  );
  assert.equal(job(state, "job-1").status, "running");
  state = cancel(state, "job-1");
  assert.equal(job(state, "job-1").status, "cancelled");
  assert.equal(runningCount(state), 0);
  state = step(state);
  assert.equal(job(state, "job-2").status, "running");
  state = run(state);
  assert.equal(job(state, "job-1").status, "cancelled");
  assert.equal(job(state, "job-2").status, "completed");
  assert.equal(events(state, "cancelled").length, 1);
});

test("cancelling a pending, final or unknown job is safe", () => {
  const state = sim(1, makeJob("job-1"));
  assert.equal(job(cancel(state, "job-1"), "job-1").status, "cancelled");
  assert.equal(cancel(state, "missing"), state);
  const done = run(state);
  assert.equal(cancel(done, "job-1"), done);
  assert.equal(job(run(cancel(state, "job-1")), "job-1").attempts, 0);
});

test("a fresh simulation from the same config is the deterministic initial state", () => {
  const { config } = preset("retries");
  const used = run(createSimulation(config));
  assert.notDeepEqual(used, createSimulation(config));
  assert.deepEqual(createSimulation(config), createSimulation(config));
  assert.equal(createSimulation(config).now, 0);
  assert.ok(
    createSimulation(config).jobs.every(
      (j) => j.status === "pending" && j.attempts === 0,
    ),
  );
});

test("summaries count states and utilization", () => {
  const state = run(
    sim(
      2,
      makeJob("job-1", { duration: 2 }),
      makeJob("job-2", { duration: 2 }),
    ),
  );
  assert.deepEqual(summarize(state), {
    now: 3,
    elapsed: 2,
    pending: 0,
    running: 0,
    completed: 2,
    failed: 0,
    cancelled: 0,
    utilization: 100,
  });
  assert.equal(
    summarize(createSimulation(preset("queue").config)).utilization,
    0,
  );
});

test("configuration validation names every problem", () => {
  const issues = (config) => validateConfig(config).map((i) => i.issue);
  assert.deepEqual(issues({ concurrency: 1, jobs: [] }), ["no-jobs"]);
  assert.ok(
    issues({ concurrency: 0, jobs: [makeJob("a")] }).includes(
      "concurrency-range",
    ),
  );
  assert.ok(
    issues({ concurrency: 1.5, jobs: [makeJob("a")] }).includes("not-integer"),
  );
  assert.ok(
    issues({ concurrency: 1, jobs: [makeJob("a"), makeJob("a")] }).includes(
      "duplicate-id",
    ),
  );
  assert.ok(
    issues({ concurrency: 1, jobs: [makeJob("a", { duration: 0 })] }).includes(
      "duration-range",
    ),
  );
  assert.ok(
    issues({ concurrency: 1, jobs: [makeJob("a", { timeout: 31 })] }).includes(
      "timeout-range",
    ),
  );
  assert.ok(
    issues({
      concurrency: 1,
      jobs: [makeJob("a", { maxRetries: 6 })],
    }).includes("retries-range"),
  );
  assert.ok(
    issues({
      concurrency: 1,
      jobs: [makeJob("a", { backoffBase: 0 })],
    }).includes("backoff-range"),
  );
  assert.ok(
    issues({
      concurrency: 1,
      jobs: [makeJob("a", { failAttempts: 7 })],
    }).includes("failures-range"),
  );
  assert.ok(
    issues({ concurrency: 1, jobs: [makeJob("a", { submitAt: 31 })] }).includes(
      "submit-range",
    ),
  );
  assert.ok(
    issues({
      concurrency: 1,
      jobs: [makeJob("a", { duration: NaN })],
    }).includes("not-integer"),
  );
  const many = Array.from({ length: LIMITS.maxJobs + 1 }, (_, i) =>
    makeJob(`j${i}`),
  );
  assert.ok(issues({ concurrency: 1, jobs: many }).includes("too-many-jobs"));
  assert.throws(
    () => createSimulation({ concurrency: 1, jobs: [] }),
    RangeError,
  );
  for (const { config } of presets)
    assert.deepEqual(validateConfig(config), []);
});

test("worst-case configurations terminate within the tick limit", () => {
  const jobs = Array.from({ length: LIMITS.maxJobs }, (_, i) =>
    makeJob(`job-${i + 1}`, {
      duration: LIMITS.maxDuration,
      timeout: 1,
      maxRetries: LIMITS.maxRetries,
      backoff: "exponential",
      backoffBase: LIMITS.maxBackoffBase,
      failAttempts: LIMITS.maxFailAttempts,
      failureKind: "hang",
      submitAt: LIMITS.maxSubmitAt,
    }),
  );
  const state = run(createSimulation({ concurrency: 1, jobs }));
  assert.ok(state.now <= LIMITS.maxTicks);
  assert.ok(state.trace.every((row) => row.length === state.now));
});
