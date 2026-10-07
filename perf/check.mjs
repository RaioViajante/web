import { mkdir, readFile, writeFile } from "node:fs/promises";
import { startServers } from "../security/local-servers.mjs";
import { pages } from "./pages.mjs";
import { weigh } from "./weight.mjs";

// Hard, deterministic performance budgets (perf/budgets.json) plus first-party
// image and font rules, measured on a cold mobile load of each representative
// page. `--baseline` prints the measured numbers and a suggested budgets block
// instead of checking; budgets are never rewritten automatically.
const baseline = process.argv.includes("--baseline");
const budgets = JSON.parse(
  await readFile(new URL("./budgets.json", import.meta.url), "utf8").catch(
    () => '{"weight":{},"largestImage":122880}',
  ),
);
const DPR = 2.625; // the emulated phone in perf/weight.mjs
const kb = (n) => `${(n / 1024).toFixed(0)}K`;

const { stop } = await startServers();
process.on("exit", stop);
const problems = [];
const softWarnings = [];
const suggestion = {};
const rows = [];

for (const page of pages) {
  const id = `${page.app}/${page.name}`;
  const w = await weigh(page);
  const at = `[${page.app}] ${page.path}`;
  rows.push({ id, w });
  suggestion[id] = {
    total: w.total.transfer,
    script: w.script.transfer,
    stylesheet: w.stylesheet.transfer,
    font: w.font.transfer,
    image: w.image.transfer,
    requests: w.requests,
  };

  // Rules that do not depend on a measured baseline.
  for (const url of w.external)
    problems.push(`${at}: request to a non-local origin: ${url}`);
  for (const f of w.failures)
    problems.push(`${at}: failed first-party request ${f}`);
  const fontFiles = new Set(w.fonts);
  if (w.fonts.length !== fontFiles.size)
    problems.push(
      `${at}: a font file was downloaded more than once: ${w.fonts.join(", ")}`,
    );
  if (fontFiles.size !== 1)
    problems.push(
      `${at}: expected one self-hosted font file, found ${fontFiles.size} (${[...fontFiles].join(", ")})`,
    );
  for (const file of fontFiles)
    if (!w.preloads.some((p) => p.split("?")[0] === file.split("?")[0]))
      problems.push(`${at}: font ${file} is downloaded but not preloaded`);
  for (const p of w.preloads)
    if (!fontFiles.has(p))
      problems.push(`${at}: preloaded font ${p} was never used`);
  for (const r of w.imageRows) {
    if (r.size === 0 || r.transfer === 0)
      problems.push(`${at}: empty image response ${r.url}`);
    if (!/^image\//.test(r.mime))
      problems.push(`${at}: image ${r.url} has type ${r.mime}`);
    if (r.transfer > budgets.largestImage)
      problems.push(
        `${at}: image ${r.url.replace(/^.*?\/\/[^/]+/, "")} is ${kb(r.transfer)}, over the ${kb(budgets.largestImage)} single-image budget`,
      );
  }
  for (const img of w.images) {
    if (img.shown[0] === 0 && !img.aboveFold) continue; // hidden or not yet needed
    if (img.complete && img.natural[0] === 0 && img.src)
      problems.push(`${at}: broken image ${img.src}`);
    if (img.shown[0] > 0 && !img.reserved)
      problems.push(
        `${at}: image without width and height attributes (layout shift risk): ${img.src.replace(/^.*?\/\/[^/]+/, "")}`,
      );
  }

  // Soft: a raster much larger than its slot at the emulated device pixel ratio.
  for (const img of w.images)
    if (img.shown[0] >= 24 && img.natural[0] > img.shown[0] * DPR * 1.5)
      softWarnings.push(
        `${at}: ${img.src.replace(/^.*?\/\/[^/]+/, "").slice(0, 70)} is ${img.natural[0]}px wide for a ${img.shown[0]}px slot (about ${Math.round(img.shown[0] * DPR)}px is enough at ${DPR}x)`,
      );

  // Weight budgets.
  const budget = budgets.weight[id];
  if (!baseline) {
    if (!budget)
      problems.push(
        `${at}: no entry in perf/budgets.json (run pnpm perf:check -- --baseline)`,
      );
    else {
      const measured = {
        total: w.total.transfer,
        script: w.script.transfer,
        stylesheet: w.stylesheet.transfer,
        font: w.font.transfer,
        image: w.image.transfer,
        requests: w.requests,
      };
      for (const [key, value] of Object.entries(measured))
        if (value > budget.max[key])
          problems.push(
            `${at}: ${key} ${key === "requests" ? value : kb(value)} exceeds the budget ${key === "requests" ? budget.max[key] : kb(budget.max[key])} (baseline ${key === "requests" ? budget.baseline[key] : kb(budget.baseline[key])})`,
          );
    }
  }
}
stop();

const pad = (s, n) => String(s).padEnd(n);
console.log(
  pad("page", 26),
  pad("total", 7),
  pad("js", 7),
  pad("css", 6),
  pad("font", 6),
  pad("images", 7),
  "requests",
);
for (const { id, w } of rows)
  console.log(
    pad(id, 26),
    pad(kb(w.total.transfer), 7),
    pad(kb(w.script.transfer), 7),
    pad(kb(w.stylesheet.transfer), 6),
    pad(kb(w.font.transfer), 6),
    pad(kb(w.image.transfer), 7),
    w.requests,
  );

if (baseline) {
  const root = rows.find((r) => r.id === "root/home").w;
  console.log("\nroot/home scripts (transfer / decoded):");
  for (const s of root.scripts)
    console.log(
      `  ${kb(s.transfer).padStart(5)} / ${kb(s.size).padStart(5)}  ${s.name}`,
    );
  console.log(`  total ${kb(root.script.transfer)} / ${kb(root.script.size)}`);
  await mkdir(new URL("./.results/", import.meta.url), { recursive: true });
  await writeFile(
    new URL("./.results/suggested.json", import.meta.url),
    JSON.stringify(suggestion, null, 2),
  );
  console.log("\nwrote perf/.results/suggested.json");
  if (problems.length)
    console.log(
      `\nrule problems (${problems.length}):\n${problems.map((p) => `  - ${p}`).join("\n")}`,
    );
  process.exit(0);
}
if (softWarnings.length)
  console.log(
    `\nSOFT (not failing):\n${[...new Set(softWarnings)].map((w) => `  - ${w}`).join("\n")}`,
  );
if (problems.length) {
  console.error(
    `\nFAILED (${problems.length}):\n${problems.map((p) => `  - ${p}`).join("\n")}`,
  );
  process.exitCode = 1;
} else console.log(`\n${rows.length} pages within their budgets.`);
