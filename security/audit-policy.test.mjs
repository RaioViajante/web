import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { evaluateAudit } from "./audit-policy.mjs";

// Fixtures shaped like `pnpm audit --json`; nothing here touches the real
// lockfile. The committed policy is used as is, so the exceptions themselves are
// what these tests protect.
const policy = JSON.parse(
  await readFile(new URL("./audit-exceptions.json", import.meta.url), "utf8"),
);
const now = new Date("2026-10-20T00:00:00Z");

const advisory = (over = {}) => ({
  id: 1,
  module_name: "braces",
  github_advisory_id: "GHSA-vfj7-8cjw-p6xm",
  severity: "high",
  patched_versions: "None",
  findings: [
    {
      version: "3.0.3",
      paths: [
        "apps__dump>eslint-config-next>@next/eslint-plugin-next>fast-glob>micromatch>braces",
      ],
    },
  ],
  ...over,
});
const sprintf = (over = {}) =>
  advisory({
    id: 2,
    module_name: "sprintf-js",
    github_advisory_id: "GHSA-hp3w-g68c-fv3c",
    severity: "moderate",
    findings: [
      {
        version: "1.0.3",
        paths: [
          "apps__dump>gray-matter>js-yaml>argparse>sprintf-js",
          "apps__dump>jest>@jest/core>js-yaml>argparse>sprintf-js",
        ],
      },
    ],
    ...over,
  });
const report = (...list) => ({
  advisories: Object.fromEntries(list.map((a, i) => [String(i + 1), a])),
});
// The production audit lists sprintf-js through gray-matter only.
const prodSprintf = (over = {}) =>
  sprintf({
    findings: [
      {
        version: "1.0.3",
        paths: ["apps__dump>gray-matter>js-yaml>argparse>sprintf-js"],
      },
    ],
    ...over,
  });
const check = (full, production, at = now, p = policy) =>
  evaluateAudit({ full, production, policy: p, now: at });
const current = () =>
  check(report(advisory(), sprintf()), report(prodSprintf()));
const has = (problems, ...parts) =>
  problems.some((p) => parts.every((part) => p.includes(part)));

test("the two reviewed exceptions pass exactly", () =>
  assert.deepEqual(current(), []));

test("the committed policy is within its 60-day window", () => {
  const limit = Date.parse(policy.decided) + policy.maxReviewDays * 86_400_000;
  for (const e of policy.exceptions)
    assert.ok(Date.parse(`${e.expires}T00:00:00Z`) <= limit, e.package);
  assert.equal(policy.exceptions.length, 2);
});

test("unknown advisories fail at every severity", () => {
  for (const severity of ["high", "moderate", "low", "info"]) {
    const problems = check(
      report(
        advisory(),
        sprintf(),
        advisory({
          id: 3,
          module_name: "left-pad",
          github_advisory_id: "GHSA-aaaa-bbbb-cccc",
          severity,
        }),
      ),
      report(prodSprintf()),
    );
    assert.ok(
      has(problems, "left-pad GHSA-aaaa-bbbb-cccc", "unreviewed"),
      severity,
    );
  }
});

test("a critical advisory fails", () => {
  const problems = check(
    report(
      advisory(),
      sprintf(),
      advisory({
        id: 4,
        module_name: "evil",
        github_advisory_id: "GHSA-x",
        severity: "critical",
      }),
    ),
    report(prodSprintf()),
  );
  assert.ok(has(problems, "evil GHSA-x", "critical advisory"));
});

test("a production HIGH fails, excepted or not", () => {
  const prodHigh = advisory({
    id: 5,
    module_name: "react-thing",
    github_advisory_id: "GHSA-y",
    severity: "high",
  });
  assert.ok(
    has(
      check(
        report(advisory(), sprintf(), prodHigh),
        report(prodSprintf(), prodHigh),
      ),
      "react-thing GHSA-y",
      "production dependency path",
    ),
  );
  // Even the braces exception cannot hide a high advisory that reaches production.
  const problems = check(
    report(advisory(), sprintf()),
    report(advisory(), prodSprintf()),
  );
  assert.ok(has(problems, "braces", "production dependency path"));
  assert.ok(has(problems, "braces", "now in a production dependency path"));
});

test("braces: a fix becoming available fails", () => {
  assert.ok(
    has(
      check(
        report(advisory({ patched_versions: ">=3.0.4" }), sprintf()),
        report(prodSprintf()),
      ),
      "braces GHSA-vfj7-8cjw-p6xm",
      "a fix is now available (>=3.0.4); upgrade and remove the exception",
    ),
  );
});

test("braces: a new affected version or an unreviewed dependency path fails", () => {
  assert.ok(
    has(
      check(
        report(
          advisory({
            findings: [
              {
                version: "3.0.2",
                paths: ["apps__dump>eslint-config-next>braces"],
              },
            ],
          }),
          sprintf(),
        ),
        report(prodSprintf()),
      ),
      "affected versions are 3.0.2",
    ),
  );
  assert.ok(
    has(
      check(
        report(
          advisory({
            findings: [{ version: "3.0.3", paths: ["apps__dump>next>braces"] }],
          }),
          sprintf(),
        ),
        report(prodSprintf()),
      ),
      "unreviewed dependency: apps__dump>next>braces",
    ),
  );
});

test("sprintf-js: severity escalation, a fix and a changed production path fail", () => {
  assert.ok(
    has(
      check(
        report(advisory(), sprintf({ severity: "high" })),
        report(prodSprintf({ severity: "high" })),
      ),
      "sprintf-js",
      "severity is now high",
    ),
  );
  assert.ok(
    has(
      check(
        report(advisory(), sprintf({ patched_versions: ">=1.1.4" })),
        report(prodSprintf()),
      ),
      "sprintf-js",
      "a fix is now available",
    ),
  );
  const moved = sprintf({
    findings: [
      { version: "1.0.3", paths: ["apps__root>some-new-parser>sprintf-js"] },
    ],
  });
  const problems = check(report(advisory(), moved), report(moved));
  assert.ok(
    has(
      problems,
      "sprintf-js",
      "production path changed: apps__root>some-new-parser>sprintf-js",
    ),
  );
  assert.ok(has(problems, "sprintf-js", "unreviewed dependency"));
});

test("sprintf-js, unlike braces, is allowed in production (and must stay there until reviewed)", () => {
  assert.deepEqual(current(), []);
  assert.ok(
    has(
      check(report(advisory(), sprintf()), report()),
      "sprintf-js",
      "no longer appears in the production audit",
    ),
  );
});

test("an expired exception fails and says to review it", () => {
  const problems = check(
    report(advisory(), sprintf()),
    report(prodSprintf()),
    new Date("2026-12-07T00:00:00Z"),
  );
  assert.ok(has(problems, "braces", "expired on 2026-12-06; review it"));
  assert.ok(has(problems, "sprintf-js", "expired on 2026-12-06"));
  assert.deepEqual(
    check(
      report(advisory(), sprintf()),
      report(prodSprintf()),
      new Date("2026-12-06T12:00:00Z"),
    ),
    [],
  );
});

test("an exception whose advisory disappeared is stale", () => {
  const problems = check(report(sprintf()), report(prodSprintf()));
  assert.ok(has(problems, "braces GHSA-vfj7-8cjw-p6xm", "stale exception"));
});

test("a changed advisory identity is not the reviewed one", () => {
  const problems = check(
    report(advisory({ github_advisory_id: "GHSA-other" }), sprintf()),
    report(prodSprintf()),
  );
  assert.ok(has(problems, "braces GHSA-other", "unreviewed"));
  assert.ok(has(problems, "braces GHSA-vfj7-8cjw-p6xm", "stale exception"));
});

test("an expiry beyond the review window is rejected", () => {
  const long = {
    ...policy,
    exceptions: policy.exceptions.map((e) => ({ ...e, expires: "2027-03-01" })),
  };
  assert.ok(
    has(
      check(report(advisory(), sprintf()), report(prodSprintf()), now, long),
      "more than 60 days after the decision",
    ),
  );
});

test("missing audit data fails instead of passing", () => {
  assert.deepEqual(evaluateAudit({ full: {}, production: {}, policy, now }), [
    "pnpm audit returned no advisory data; the gate cannot judge it",
  ]);
});

test("docs/security-maintenance.md names every exception and its expiry", async () => {
  const doc = await readFile(
    new URL("../docs/security-maintenance.md", import.meta.url),
    "utf8",
  );
  for (const e of policy.exceptions) {
    assert.ok(doc.includes(e.advisory), `${e.advisory} is not in the doc`);
    assert.ok(doc.includes(e.package), `${e.package} is not in the doc`);
    assert.ok(doc.includes(e.expires), `${e.expires} is not in the doc`);
  }
});
