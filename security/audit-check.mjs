import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { evaluateAudit } from "./audit-policy.mjs";

// `pnpm audit:check`: runs pnpm's own audit, in full and for production
// dependencies, and applies security/audit-exceptions.json. It needs the
// registry, so it is not part of the offline `pnpm validate`; CI runs it as the
// separate `dependency-audit` job and weekly. Exit 1: a policy problem;
// exit 2: the audit itself could not run.
const run = (args) => {
  const result = spawnSync("pnpm", ["audit", "--json", ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  try {
    return JSON.parse(result.stdout);
  } catch {
    console.error(
      `pnpm audit ${args.join(" ")} did not return JSON:\n${(result.stderr || result.stdout).slice(0, 500)}`,
    );
    process.exit(2);
  }
};
const policy = JSON.parse(
  await readFile(new URL("./audit-exceptions.json", import.meta.url), "utf8"),
);
const full = run([]);
const production = run(["--prod"]);
const problems = evaluateAudit({ full, production, policy });
const count = (r) => Object.keys(r.advisories ?? {}).length;
if (problems.length) {
  console.error(
    `Dependency audit FAILED (${problems.length}):\n${problems.map((p) => `  - ${p}`).join("\n")}`,
  );
  process.exit(1);
}
console.log(
  `Dependency audit passes: ${count(full)} reviewed advisories (${count(production)} in production), 0 critical, no production HIGH. Exceptions expire ${[...new Set(policy.exceptions.map((e) => e.expires))].join(", ")}.`,
);
