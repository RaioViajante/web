import assert from "node:assert/strict";
import { test } from "node:test";
import { LOCALE_IDS, LOCALES } from "../../../site/locales.ts";
import { schedulerCopy } from "../src/lib/scheduler-copy.ts";
import {
  cellMark,
  detailText,
  eventText,
  percent,
  progressText,
  tableCounter,
} from "../src/lib/scheduler-view.ts";
import { catalogCounter, countTable } from "../src/lib/scheduler-count.ts";
import {
  createSimulation,
  makeJob,
  preset,
  presets,
  run,
  step,
} from "../src/lib/scheduler-sim.ts";
import { placeholders } from "../src/lib/template.ts";
import { countedFor } from "../src/lib/plural-core.ts";

const intl = (locale) => LOCALES[locale].intlLocale;
const leaves = (value, path = "") =>
  typeof value === "string"
    ? [[path, value]]
    : Object.entries(value).flatMap(([key, child]) =>
        leaves(child, path ? `${path}.${key}` : key),
      );
const withoutZero = ([path]) => !/\.none$/.test(path);

test("the scheduler catalog has the same keys and placeholders in both locales", () => {
  assert.deepEqual(Object.keys(schedulerCopy).sort(), [...LOCALE_IDS].sort());
  const en = leaves(schedulerCopy.en).filter(withoutZero);
  const pt = leaves(schedulerCopy["pt-BR"]).filter(withoutZero);
  assert.deepEqual(
    pt.map(([path]) => path),
    en.map(([path]) => path),
  );
  en.forEach(([path, value], index) =>
    assert.deepEqual(placeholders(pt[index][1]), placeholders(value), path),
  );
});

// Technical loanwords and model vocabulary that read the same in Portuguese.
const sameInBothLanguages = [
  "backoffOptions.exponential",
  "backoffOptions.fixed",
  "backoffOptions.none",
  "concepts.3.term",
  "concepts.4.term",
  "concepts.5.term",
  "failureOptions.error",
  "failureOptions.hang",
  "fields.backoff",
  "fields.timeout",
  "jobLegend",
  "marks.cancelled",
  "marks.done",
  "marks.failed",
  "noAction",
  "presets.timeout.name",
  "statusBand",
  "statusHeaders.0",
  "tickLabel",
  "ticks.one",
  "ticks.other",
  "timelineJob",
];

test("Portuguese strings are translated except the model vocabulary", () => {
  const pt = new Map(leaves(schedulerCopy["pt-BR"]));
  const same = leaves(schedulerCopy.en)
    .filter(([path, value]) => pt.get(path) === value)
    .map(([path]) => path);
  assert.deepEqual(same.sort(), sameInBothLanguages);
});

test("every counted phrase supplies zero wording where the locale needs it", () => {
  for (const [name, forms] of Object.entries(schedulerCopy["pt-BR"])) {
    if (
      forms &&
      typeof forms === "object" &&
      "one" in forms &&
      "other" in forms
    ) {
      if (name === "speedValue" || name === "retryIn") continue; // never zero
      assert.ok(forms.none, `pt-BR ${name} needs a zero form`);
    }
  }
});

test("plural forms follow each locale's rules", () => {
  const { jobsCompleted, ticks } = schedulerCopy.en;
  assert.equal(countedFor("en-US", 0, jobsCompleted), "0 jobs completed");
  assert.equal(countedFor("en-US", 1, jobsCompleted), "1 job completed");
  assert.equal(countedFor("en-US", 2, ticks), "2 ticks");
  const pt = schedulerCopy["pt-BR"];
  assert.equal(
    countedFor("pt-BR", 0, pt.jobsCompleted),
    "nenhum job concluído",
  );
  assert.equal(countedFor("pt-BR", 1, pt.jobsFailed), "1 job falhou");
  assert.equal(countedFor("pt-BR", 3, pt.jobsFailed), "3 jobs falharam");
  assert.equal(countedFor("pt-BR", 1, pt.ticks), "1 tick");
});

test("percent follows the locale's numeric formatting", () => {
  assert.equal(percent("en-US", 67), "67%");
  assert.equal(percent("pt-BR", 67), "67%");
  assert.equal(percent("pt-BR", 0), "0%");
});

test("every event kind renders in both locales without a leftover placeholder", () => {
  for (const locale of LOCALE_IDS) {
    const copy = schedulerCopy[locale];
    for (const { config } of presets) {
      const state = run(createSimulation(config));
      for (const event of state.events)
        assert.doesNotMatch(
          eventText(copy, catalogCounter(copy, intl(locale)), event),
          /[{}]/,
        );
      assert.doesNotMatch(
        progressText(
          copy,
          intl(locale),
          catalogCounter(copy, intl(locale)),
          state,
        ),
        /[{}]/,
      );
    }
  }
});

test("a retry event states its delay with the right plural", () => {
  const state = run(
    createSimulation({
      concurrency: 1,
      jobs: [
        makeJob("job-1", {
          duration: 1,
          failAttempts: 1,
          maxRetries: 1,
          backoff: "fixed",
          backoffBase: 1,
        }),
      ],
    }),
  );
  const retry = state.events.find((e) => e.kind === "retry-scheduled");
  assert.match(
    eventText(
      schedulerCopy.en,
      catalogCounter(schedulerCopy.en, "en-US"),
      retry,
    ),
    /will retry in 1 tick$/,
  );
  assert.match(
    eventText(
      schedulerCopy["pt-BR"],
      catalogCounter(schedulerCopy["pt-BR"], "pt-BR"),
      retry,
    ),
    /de novo em 1 tick$/,
  );
  const now = run(
    createSimulation({
      concurrency: 1,
      jobs: [makeJob("job-1", { failAttempts: 1, maxRetries: 1 })],
    }),
  );
  const immediate = now.events.find((e) => e.kind === "retry-scheduled");
  assert.match(
    eventText(
      schedulerCopy.en,
      catalogCounter(schedulerCopy.en, "en-US"),
      immediate,
    ),
    /immediately$/,
  );
  const gave = run(
    createSimulation({
      concurrency: 1,
      jobs: [makeJob("job-1", { failAttempts: 1 })],
    }),
  );
  assert.match(
    eventText(
      schedulerCopy["pt-BR"],
      catalogCounter(schedulerCopy["pt-BR"], "pt-BR"),
      gave.events.find((e) => e.kind === "gave-up"),
    ),
    /falhou de vez após 1 tentativa$/,
  );
});

test("progress text reports the finished and the halted outcomes", () => {
  const done = run(createSimulation(preset("queue").config));
  assert.match(
    progressText(
      schedulerCopy.en,
      "en-US",
      catalogCounter(schedulerCopy.en, "en-US"),
      done,
    ),
    /^Finished after 9 ticks: 3 jobs completed, 0 jobs failed/,
  );
  assert.match(
    progressText(
      schedulerCopy["pt-BR"],
      "pt-BR",
      catalogCounter(schedulerCopy["pt-BR"], "pt-BR"),
      done,
    ),
    /^Terminou após 9 ticks: 3 jobs concluídos, nenhum job falhou/,
  );
  const halted = run(createSimulation(preset("stall").config));
  assert.match(
    progressText(
      schedulerCopy.en,
      "en-US",
      catalogCounter(schedulerCopy.en, "en-US"),
      halted,
    ),
    /^Stopped at the limit of 120 ticks: 1 still running, 1 still pending/,
  );
  const mid = step(createSimulation(preset("queue").config));
  assert.match(
    progressText(
      schedulerCopy.en,
      "en-US",
      catalogCounter(schedulerCopy.en, "en-US"),
      mid,
    ),
    /^Tick 1: 1 running, 2 pending/,
  );
});

test("timeline marks print a final mark once and details match the state", () => {
  const copy = schedulerCopy.en;
  const state = run(
    createSimulation({
      concurrency: 1,
      jobs: [
        makeJob("job-1", { duration: 1 }),
        makeJob("job-2", { submitAt: 3, duration: 1 }),
      ],
    }),
  );
  const row = state.trace[0];
  assert.equal(cellMark(copy, row, 0), "R");
  assert.equal(cellMark(copy, row, 1), "C");
  assert.equal(cellMark(copy, row, 2), "");
  assert.equal(
    detailText(copy, state.jobs[0], state.now),
    "finished at tick 1",
  );
  const early = createSimulation({
    concurrency: 1,
    jobs: [makeJob("late", { submitAt: 5 })],
  });
  assert.equal(
    detailText(copy, early.jobs[0], early.now),
    "not ready until tick 5",
  );
});

test("scenario hints name the behavior the scenario really produces", () => {
  const outcome = (id) => run(createSimulation(preset(id).config));
  assert.equal(outcome("retries").jobs[0].status, "completed");
  assert.equal(outcome("retries").jobs[0].attempts, 3);
  assert.equal(outcome("exhausted").jobs[0].status, "failed");
  assert.equal(outcome("timeout").jobs[0].attempts, 2);
  assert.equal(outcome("timeout").jobs[1].status, "completed");
  assert.equal(outcome("stall").jobs[1].status, "pending");
  const starts = outcome("exponential")
    .events.filter((e) => e.kind === "retry-scheduled")
    .map((e) => e.delay);
  assert.deepEqual(starts, [1, 2, 4, 8]);
  const concurrency = outcome("concurrency");
  const longest = Math.max(
    ...presets
      .find((p) => p.id === "concurrency")
      .config.jobs.map((j) => j.duration),
  );
  assert.ok(concurrency.now - 1 >= longest);
});

test("the rendered count table gives the browser the same wording as the plural rules", () => {
  for (const locale of LOCALE_IDS) {
    const copy = schedulerCopy[locale];
    const direct = catalogCounter(copy, intl(locale));
    const fromTable = tableCounter(countTable(direct));
    for (const [phrase, limit] of [
      ["ticks", 121],
      ["retryIn", 64],
      ["attempts", 8],
      ["jobsFailed", 8],
      ["speedValue", 16],
    ])
      for (let n = 0; n <= limit; n += 1)
        assert.equal(
          fromTable(phrase, n),
          direct(phrase, n),
          `${locale} ${phrase} ${n}`,
        );
    assert.throws(() => fromTable("ticks", 999), RangeError);
  }
  assert.equal(
    tableCounter(countTable(catalogCounter(schedulerCopy["pt-BR"], "pt-BR")))(
      "ticks",
      0,
    ),
    "nenhum tick",
  );
});
