// The pass/fail rules for Lighthouse results, kept pure so they are tested with
// fixtures (lighthouse-policy.test.mjs). A sample is one Lighthouse run:
// { scores: { performance, accessibility, "best-practices", seo }, metrics: { lcp, cls, ... } }.
// `metrics.lcp === null` means Lighthouse could not collect an LCP (NO_LCP) and
// scored performance 0; that score is a collection failure, never a result.

const category = {
  performance: "performance",
  accessibility: "accessibility",
  "best-practices": "best-practices",
  seo: "seo",
};
const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
export const isNoLcp = (sample) => sample.metrics.lcp === null;

/** The explicit, narrow list of known Lighthouse collection failures (budgets.json). */
export function knownNoLcp(known, { app, path, profile }) {
  return known.find(
    (k) => k.app === app && k.route === path && k.profile === profile,
  );
}

/**
 * Independent proof that the page really has an LCP, from the browser's own
 * PerformanceObserver. It proves existence only: no numeric threshold.
 */
export function judgeBrowserLcp(observation) {
  const reasons = [];
  if (observation.status !== 200) reasons.push(`HTTP ${observation.status}`);
  if (!observation.entries?.length)
    reasons.push("the browser observed no largest-contentful-paint entry");
  if (!observation.visibleText || observation.visibleText < 20)
    reasons.push("no visible content");
  for (const e of observation.pageErrors ?? [])
    reasons.push(`page error: ${e}`);
  for (const f of observation.failedRequests ?? [])
    reasons.push(`failed first-party request: ${f}`);
  return { ok: reasons.length === 0, reasons };
}

/**
 * @param samples Lighthouse runs for one page and profile
 * @param floors  hard floors, e.g. { performance: 90, accessibility: 100, ..., cls: 0.02 }
 * @param options.known      matching known-NO_LCP entry, if any
 * @param options.browserLcp async () => judgeBrowserLcp result, called only for a known exception
 * @param options.quality    soft targets, e.g. { performance: 95 }
 * @returns { problems, notes, valid, noLcp, performance }
 */
export async function evaluate(
  samples,
  floors,
  { known, browserLcp, quality = {} } = {},
) {
  const problems = [];
  const notes = [];
  const valid = samples.filter((s) => !isNoLcp(s));
  const noLcp = samples.length - valid.length;

  if (noLcp) {
    if (!known)
      problems.push(
        `Lighthouse could not collect an LCP (NO_LCP) in ${noLcp} of ${samples.length} runs; this page/profile is not a known exception`,
      );
    else {
      const proof = await browserLcp();
      if (!proof.ok)
        problems.push(
          `NO_LCP is only accepted while the browser observes a real LCP, and it did not: ${proof.reasons.join("; ")}`,
        );
      else
        notes.push(
          `${noLcp} of ${samples.length} Lighthouse runs returned NO_LCP (known tool anomaly: ${known.why}); an independent browser observation found an LCP, ${valid.length} runs were valid`,
        );
    }
  }

  let performance = null;
  for (const [key, floor] of Object.entries(floors)) {
    if (floor === null || floor === undefined || key === "cls") continue;
    if (key === "performance") {
      if (!valid.length) {
        notes.push(
          "Lighthouse performance score unavailable: every run returned NO_LCP; no score is reported",
        );
        continue;
      }
      performance = median(valid.map((s) => s.scores.performance));
      if (performance < floor)
        problems.push(`performance ${performance} is below the floor ${floor}`);
      else if (quality.performance && performance < quality.performance)
        notes.push(
          `performance ${performance} passes the floor ${floor} but is below the quality target ${quality.performance}`,
        );
      continue;
    }
    const value = median(samples.map((s) => s.scores[category[key]]));
    if (value < floor)
      problems.push(`${key} ${value} is below the floor ${floor}`);
  }
  const cls = Math.max(...samples.map((s) => s.metrics.cls ?? 0));
  if (cls > floors.cls) problems.push(`CLS ${cls} exceeds ${floors.cls}`);
  return { problems, notes, valid: valid.length, noLcp, performance };
}
