import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

// Policy for our own GitHub workflows and composite actions (docs/ci.md). A
// source-level check on files we control, not a YAML parser: it keeps the
// rules that matter from regressing quietly.
const root = new URL("../.github/", import.meta.url);
async function files(dir = root) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const url = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
    if (entry.isDirectory()) out.push(...(await files(url)));
    else if (/\.ya?ml$/.test(entry.name)) out.push(url);
  }
  return out;
}
const all = await Promise.all(
  (await files()).map(async (url) => ({
    name: url.pathname.split("/.github/")[1],
    text: await readFile(url, "utf8"),
  })),
);
const workflows = all.filter((f) => f.name.startsWith("workflows/"));
const ci = workflows.find((f) => f.name === "workflows/ci.yml");
const uncomment = (text) => text.replace(/^\s*#.*$/gm, "");

test("there is a CI workflow and nothing else is hiding in .github", () => {
  assert.ok(ci, ".github/workflows/ci.yml is missing");
});

test("every external action is pinned to a full commit SHA with a version comment", () => {
  for (const { name, text } of all)
    for (const [, ref, rest] of text.matchAll(
      /^\s*-?\s*uses:\s*(\S+)(.*)$/gm,
    )) {
      if (ref.startsWith("./")) continue;
      assert.match(
        ref,
        /^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/,
        `${name}: ${ref} is not pinned to a 40-character SHA`,
      );
      assert.match(
        rest,
        /#\s*v\d+\.\d+\.\d+/,
        `${name}: ${ref} lacks a "# vX.Y.Z" comment`,
      );
    }
});

test("no pull_request_target, write-all or id-token anywhere", () => {
  for (const { name, text } of all) {
    const code = uncomment(text);
    assert.ok(
      !/pull_request_target/.test(code),
      `${name}: pull_request_target`,
    );
    assert.ok(!/write-all/.test(code), `${name}: permissions: write-all`);
    assert.ok(!/id-token/.test(code), `${name}: id-token permission`);
  }
});

// Write access is allowed in exactly one place: CodeQL's job may upload its
// results (`security-events: write`). Everything else is contents: read, with no
// job-level widening, so a new write permission anywhere fails here.
test("only the CodeQL job may write, and only security events", () => {
  for (const { name, text } of all) {
    const code = uncomment(text);
    const writes = [...code.matchAll(/^\s*([\w-]+):\s*write\b/gm)].map(
      (m) => m[1],
    );
    if (name === "workflows/codeql.yml")
      assert.deepEqual(writes, ["security-events"], name);
    else assert.deepEqual(writes, [], `${name}: write permission`);
  }
  for (const { name, text } of workflows) {
    const code = uncomment(text);
    assert.match(
      code,
      /^permissions:\n {2}contents: read\n(?:\s*\n)*(?=\S)/m,
      `${name}: top-level permissions must be exactly contents: read`,
    );
    if (name !== "workflows/codeql.yml")
      assert.ok(
        !/^ {2,}permissions:/m.test(code),
        `${name}: jobs must not widen permissions`,
      );
  }
  const codeql = uncomment(
    workflows.find((f) => f.name === "workflows/codeql.yml").text,
  ).replace(/\n\s*\n/g, "\n");
  const job = /^ {4}permissions:\n((?: {6}.*\n)+)/m.exec(codeql)?.[1] ?? "";
  assert.deepEqual(
    job
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .sort(),
    ["contents: read", "security-events: write"],
  );
});

test("composite actions are inside the pinning guard", () => {
  const setup = all.find((f) => f.name === "actions/setup/action.yml");
  assert.ok(setup, "the local setup action was not scanned");
  const external = [...setup.text.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)]
    .map((m) => m[1])
    .filter((u) => !u.startsWith("./"));
  assert.ok(
    external.length >= 3,
    "the composite action's external actions were not seen",
  );
});

test("every workflow cancels stale runs, bounds its jobs, and uses an off-peak schedule", () => {
  for (const { name, text } of workflows) {
    const code = uncomment(text);
    assert.match(
      code,
      /^concurrency:\n(?:(?: {2}.*)?\n)*? {2}cancel-in-progress: true$/m,
      `${name}: concurrency`,
    );
    const jobs = code
      .split(/^jobs:\n/m)[1]
      .split(/^ {2}(?=[\w-]+:$)/m)
      .filter(Boolean);
    for (const job of jobs)
      assert.match(
        job,
        /timeout-minutes: \d+/,
        `${name}: a job lacks timeout-minutes`,
      );
    for (const [, cron] of code.matchAll(/cron:\s*"([^"]+)"/g)) {
      const [minute, , , , day] = cron.split(" ");
      assert.equal(cron.split(" ").length, 5, `${name}: ${cron}`);
      assert.ok(
        !["0", "15", "30", "45"].includes(minute),
        `${name}: ${cron} runs on a busy minute`,
      );
      assert.notEqual(
        day,
        "*",
        `${name}: ${cron} should run weekly, not daily`,
      );
    }
  }
});

test("scheduled and security workflows read only, no secrets, and no audit suppression", () => {
  for (const { name, text } of all) {
    const code = uncomment(text);
    assert.ok(!/secrets\.|GITHUB_TOKEN/.test(code), `${name}: secrets`);
    assert.ok(
      !/audit[^\n]*\|\|\s*(true|:)/.test(code),
      `${name}: audit failure suppressed`,
    );
  }
  const maintenance = uncomment(
    workflows.find((f) => f.name === "workflows/security-maintenance.yml").text,
  );
  assert.ok(
    maintenance.includes("node security/sync-vercel.mjs --check") &&
      maintenance.includes("pnpm audit:check"),
  );
  assert.ok(
    !/continue-on-error/.test(maintenance),
    "maintenance failures must be visible",
  );
  assert.match(
    maintenance,
    /^on:\n {2}schedule:\n(?: {4}.*\n)+ {2}workflow_dispatch:/m,
  );
});

test("ci.yml: workflow-level read-only permissions, concurrency, timeouts and no secrets", () => {
  const code = uncomment(ci.text);
  assert.match(
    code,
    /^permissions:\n {2}contents: read\n(?:\s*\n)*(?=\S)/m,
    "top-level permissions must be exactly contents: read",
  );
  assert.ok(
    !/^ {2,}permissions:/m.test(code),
    "jobs must not widen permissions",
  );
  assert.match(
    code,
    /^concurrency:\n(?:(?: {2}.*)?\n)*? {2}cancel-in-progress: true$/m,
  );
  assert.match(code, /group: ci-\$\{\{ github\.workflow \}\}-/);
  assert.ok(
    !/secrets\.|GITHUB_TOKEN/.test(code),
    "the quality gate needs no secrets",
  );
  assert.ok(
    /^on:\n {2}pull_request:\n {2}push:\n {4}branches: \[main\]\n {2}workflow_dispatch:/m.test(
      code,
    ),
  );
  const jobs = code
    .split(/^jobs:\n/m)[1]
    .split(/^ {2}(?=[\w-]+:$)/m)
    .filter(Boolean);
  assert.ok(jobs.length >= 2);
  for (const job of jobs)
    assert.match(
      job,
      /timeout-minutes: \d+/,
      `a job lacks timeout-minutes:\n${job.slice(0, 60)}`,
    );
});

test("every checkout drops its credentials", () => {
  for (const { name, text } of all)
    for (const m of text.matchAll(
      /actions\/checkout@\S+.*\n((?:\s+.*\n){0,4})/g,
    ))
      assert.match(
        m[1],
        /persist-credentials: false/,
        `${name}: checkout keeps credentials`,
      );
});

test("event data never reaches a shell command", () => {
  for (const { name, text } of all) {
    const lines = uncomment(text).split("\n");
    for (let i = 0; i < lines.length; i++) {
      const run = /^(\s*)-?\s*run:\s*(.*)$/.exec(lines[i]);
      if (!run) continue;
      const block = [run[2]];
      if (/^[|>]/.test(run[2]))
        for (
          let j = i + 1;
          j < lines.length &&
          (lines[j].trim() === "" || lines[j].search(/\S/) > run[1].length + 1);
          j++
        )
          block.push(lines[j]);
      assert.ok(
        !/\$\{\{/.test(block.join("\n")),
        `${name}: expression inside run: ${block.join(" ").slice(0, 80)}; pass it through env: instead`,
      );
    }
  }
});

test("blocking and observational checks stay on their own sides", () => {
  const code = uncomment(ci.text);
  const [, quality, observational] = code.split(
    /^ {2}(?=quality:|observational:)/m,
  );
  assert.ok(quality && observational);
  assert.ok(
    !/continue-on-error/.test(quality),
    "the quality job must not tolerate failures",
  );
  assert.match(observational, /continue-on-error: true/);
  assert.match(observational, /needs: quality/);
  for (const only of ["perf:lighthouse", "links:external"]) {
    assert.ok(!quality.includes(only), `${only} must not block`);
    assert.ok(observational.includes(only));
  }
  assert.ok(
    !/pnpm security:origins\n(?!\s+env:\n\s+ORIGINS_SKIP_THIRD_PARTY)/.test(
      quality,
    ),
    "the blocking origin check must skip live third parties",
  );
  for (const gate of [
    "pnpm validate",
    "pnpm browser:check",
    "pnpm seo:verify",
    "node security/verify-http.mjs",
    "pnpm perf:check",
    "pnpm links:check",
    "ORIGINS_SKIP_THIRD_PARTY",
  ])
    assert.ok(quality.includes(gate), `quality lacks ${gate}`);
});

test("installs are frozen, and Node and pnpm come from the repository's own pins", () => {
  const setup = all.find((f) => f.name === "actions/setup/action.yml").text;
  assert.match(setup, /pnpm install --frozen-lockfile/);
  assert.match(setup, /node-version-file: \.nvmrc/);
  assert.ok(
    !/node-version:/.test(setup) &&
      !/^\s+version:\s/m.test(
        uncomment(setup.replace(/firefox-version:.*/, "")),
      ),
    "versions must not be duplicated in the workflow",
  );
  assert.ok(!/cache:\s*\S*node_modules/.test(setup));
});

test("the dependency audit blocks in CI and is exact", () => {
  const code = uncomment(ci.text);
  const audit = code.split(/^ {2}(?=dependency-audit:)/m)[1];
  assert.ok(audit, "ci.yml has no dependency-audit job");
  assert.ok(audit.includes("run: pnpm audit:check"));
  assert.ok(!/continue-on-error/.test(audit), "the audit job must block");
  assert.ok(
    !/needs:/.test(audit),
    "the audit job must not wait for the other checks",
  );
  assert.ok(
    !/pnpm audit(?!:)/.test(code.replace(/pnpm audit:check/g, "")),
    "use the policy gate, not raw pnpm audit",
  );
});

test("dependabot keeps the pinned actions current without auto-merging", () => {
  const config = all.find((f) => f.name === "dependabot.yml");
  assert.ok(config, ".github/dependabot.yml is missing");
  const code = uncomment(config.text);
  assert.match(code, /package-ecosystem: github-actions/);
  assert.match(code, /interval: weekly/);
  // The local composite action's external pins are updated too.
  assert.match(code, /\/\.github\/actions\/\*/);
  assert.ok(
    !/auto-?merge|labels:|assignees:|reviewers:/i.test(code),
    "no auto-merge, labels, assignees or reviewers",
  );
  // Minor and patch updates are grouped; majors are not.
  assert.match(code, /update-types:\n\s+- minor\n\s+- patch/);
  assert.ok(!/- major/.test(code));
});

test("CodeQL skips external fork pull requests instead of widening access", () => {
  const code = uncomment(
    workflows.find((f) => f.name === "workflows/codeql.yml").text,
  );
  assert.match(
    code,
    /^ {4}if: github\.event_name != 'pull_request' \|\| github\.event\.pull_request\.head\.repo\.full_name == github\.repository$/m,
    "the fork guard on the CodeQL job was removed or changed",
  );
  assert.ok(!/pull_request_target/.test(code));
  // Event data stays in `if:`, never in a shell command (the run-block test also checks this).
  assert.ok(!/run:[^\n]*\$\{\{/.test(code));
});
