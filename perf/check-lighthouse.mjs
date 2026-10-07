import { readFile } from "node:fs/promises";
import { observeBrowserLcp } from "./browser-lcp.mjs";
import { startServers } from "../security/local-servers.mjs";
import { measure } from "./lighthouse.mjs";
import { evaluate, judgeBrowserLcp, knownNoLcp } from "./lighthouse-policy.mjs";

// Lighthouse floors from perf/budgets.json on the representative pages, mobile
// and desktop. Synthetic lab data against local production builds, not
// real-user Core Web Vitals. Hard floors fail; soft timings only warn. A
// page/profile below a hard floor is measured twice more and the median
// decides, because simulated throttling varies by a few points (docs/performance.md).
// Usage: --runs N (initial runs, default 1), --only app[/page].
const args = process.argv.slice(2);
const runs = Number(args[args.indexOf("--runs") + 1]) || 1;
const only = args.includes("--only")
  ? args[args.indexOf("--only") + 1]
  : undefined;
const { lighthouse: budget } = JSON.parse(
  await readFile(new URL("./budgets.json", import.meta.url), "utf8"),
);
const median = (values) =>
  values.length
    ? [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
    : "n/a";

function floorsFor(id, name, profile) {
  const floors = { ...budget.hard };
  for (const key of [name, `${id}`, `${id}:${profile}`]) {
    const override = budget.hardOverrides[key];
    if (override)
      for (const [k, v] of Object.entries(override))
        if (!k.startsWith("_")) floors[k] = v;
  }
  return floors;
}
async function judge(r, samples, floors) {
  const known = knownNoLcp(budget.knownNoLcp ?? [], r);
  return evaluate(samples, floors, {
    known,
    quality: budget.quality,
    browserLcp: async () => judgeBrowserLcp(await observeBrowserLcp(r)),
  });
}

// Own the servers for the whole run: the browser fallback needs them after the
// Lighthouse matrix has finished.
const { stop } = await startServers();
process.on("exit", stop);
const results = await measure({
  runs,
  only: only ? (p) => `${p.app}/${p.name}`.startsWith(only) : undefined,
});
const failures = [];
const warnings = [];
console.log(
  "\napp/page                      profile  perf  a11y  bp   seo  | LCP    FCP    TBT  CLS   (lab)",
);
for (const r of results) {
  const id = `${r.app}/${r.name}`;
  const floors = floorsFor(id, r.name, r.profile);
  let samples = r.samples;
  let { problems, notes, valid, noLcp, performance } = await judge(
    r,
    samples,
    floors,
  );
  // A floor miss is re-measured twice (the median decides); NO_LCP is not retried away.
  if (
    problems.some((p) => p.includes("below the floor")) &&
    samples.length < 3
  ) {
    const more = await measure({
      runs: 2,
      only: (p) => p.app === r.app && p.name === r.name,
    }).then((all) => all.find((x) => x.profile === r.profile).samples);
    samples = [...samples, ...more];
    ({ problems, notes, valid, noLcp, performance } = await judge(
      r,
      samples,
      floors,
    ));
    console.log(
      `  (re-measured ${id} ${r.profile}: median of ${samples.length})`,
    );
  }
  const m = (f) => median(samples.map(f).filter((v) => Number.isFinite(v)));
  const lcp = m((s) => s.metrics.lcp);
  console.log(
    `${id.padEnd(30)}${r.profile.padEnd(9)}${String(performance ?? "n/a").padEnd(6)}${String(m((s) => s.scores.accessibility)).padEnd(6)}${String(m((s) => s.scores["best-practices"])).padEnd(5)}${String(m((s) => s.scores.seo)).padEnd(5)}| ${String(lcp).padEnd(7)}${String(m((s) => s.metrics.fcp)).padEnd(7)}${String(m((s) => s.metrics.tbt)).padEnd(5)}${m((s) => s.metrics.cls)}`,
  );
  if (noLcp)
    console.log(
      `  ${id} ${r.profile}: ${valid} valid Lighthouse run(s), ${noLcp} NO_LCP`,
    );
  for (const n of notes)
    warnings.push(`[${r.app}] ${r.path} [${r.profile}]: ${n}`);
  for (const p of problems)
    failures.push(`[${r.app}] ${r.path} [${r.profile}]: ${p}`);
  const soft = budget.soft[r.profile];
  for (const [key, field] of [
    ["fcp_ms", "fcp"],
    ["lcp_ms", "lcp"],
    ["tbt_ms", "tbt"],
    ["si_ms", "si"],
  ]) {
    const v = m((s) => s.metrics[field]);
    if (Number.isFinite(v) && v > soft[key])
      warnings.push(
        `[${r.app}] ${r.path} [${r.profile}]: ${field.toUpperCase()} ${v} ms is over the soft threshold ${soft[key]} ms`,
      );
  }
}
stop();
if (warnings.length)
  console.log(
    `\nSOFT (not failing):\n${warnings.map((w) => `  - ${w}`).join("\n")}`,
  );
if (failures.length) {
  console.error(
    `\nFAILED (${failures.length}):\n${failures.map((f) => `  - ${f}`).join("\n")}`,
  );
  process.exitCode = 1;
} else console.log("\nLighthouse floors hold.");
