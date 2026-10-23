import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { evaluateAudit } from "./audit-policy.mjs";

// Fixtures shaped like `pnpm audit --json`; nothing here touches the real
// lockfile. Synthetic development and production exceptions exercise every
// exception guard without weakening the committed empty policy.
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
const parser = (over = {}) =>
  advisory({
    id: 2,
    module_name: "example-parser",
    github_advisory_id: "GHSA-example",
    severity: "moderate",
    findings: [
      {
        version: "1.0.3",
        paths: [
          "apps__dump>gray-matter>example-parser",
          "apps__dump>jest>example-parser",
        ],
      },
    ],
    ...over,
  });
const reviewedDevelopment = (over = {}) =>
  advisory({
    module_name: "example-dev",
    github_advisory_id: "GHSA-example-dev",
    findings: [
      {
        version: "3.0.3",
        paths: ["apps__dump>eslint-config-next>example-dev"],
      },
    ],
    ...over,
  });
const report = (...list) => ({
  advisories: Object.fromEntries(list.map((a, i) => [String(i + 1), a])),
});
const developmentPolicy = {
  ...policy,
  exceptions: [
    {
      package: "example-dev",
      advisory: "GHSA-example-dev",
      severity: "high",
      versions: ["3.0.3"],
      reachedThrough: ["eslint-config-next"],
      production: false,
      expires: "2026-12-06",
    },
  ],
};
const productionPolicy = {
  ...policy,
  exceptions: [
    {
      package: "example-parser",
      advisory: "GHSA-example",
      severity: "moderate",
      versions: ["1.0.3"],
      reachedThrough: ["gray-matter", "jest"],
      production: true,
      productionPaths: ["apps__dump>gray-matter>example-parser"],
      expires: "2026-12-06",
    },
  ],
};
const prodParser = (over = {}) =>
  parser({
    findings: [
      {
        version: "1.0.3",
        paths: ["apps__dump>gray-matter>example-parser"],
      },
    ],
    ...over,
  });
const check = (full, production, at = now, p = policy) =>
  evaluateAudit({ full, production, policy: p, now: at });
const current = () =>
  check(report(reviewedDevelopment()), report(), now, developmentPolicy);
const has = (problems, ...parts) =>
  problems.some((p) => parts.every((part) => p.includes(part)));

test("a reviewed development exception passes exactly", () =>
  assert.deepEqual(current(), []));

test("the committed policy is within its 60-day window", () => {
  const limit = Date.parse(policy.decided) + policy.maxReviewDays * 86_400_000;
  for (const e of policy.exceptions)
    assert.ok(Date.parse(`${e.expires}T00:00:00Z`) <= limit, e.package);
  assert.equal(policy.exceptions.length, 0);
});

test("unknown advisories fail at every severity", () => {
  for (const severity of ["high", "moderate", "low", "info"]) {
    const problems = check(
      report(
        reviewedDevelopment(),
        advisory({
          id: 3,
          module_name: "left-pad",
          github_advisory_id: "GHSA-aaaa-bbbb-cccc",
          severity,
        }),
      ),
      report(),
      now,
      developmentPolicy,
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
      reviewedDevelopment(),
      advisory({
        id: 4,
        module_name: "evil",
        github_advisory_id: "GHSA-x",
        severity: "critical",
      }),
    ),
    report(),
    now,
    developmentPolicy,
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
        report(reviewedDevelopment(), prodHigh),
        report(prodHigh),
        now,
        developmentPolicy,
      ),
      "react-thing GHSA-y",
      "production dependency path",
    ),
  );
  // Even a reviewed development exception cannot hide a HIGH that reaches production.
  const problems = check(
    report(reviewedDevelopment()),
    report(reviewedDevelopment()),
    now,
    developmentPolicy,
  );
  assert.ok(has(problems, "example-dev", "production dependency path"));
  assert.ok(
    has(problems, "example-dev", "now in a production dependency path"),
  );
});

test("a fix becoming available invalidates a development exception", () => {
  assert.ok(
    has(
      check(
        report(reviewedDevelopment({ patched_versions: ">=3.0.4" })),
        report(),
        now,
        developmentPolicy,
      ),
      "example-dev GHSA-example-dev",
      "a fix is now available (>=3.0.4); upgrade and remove the exception",
    ),
  );
});

test("a new affected version or dependency path invalidates an exception", () => {
  assert.ok(
    has(
      check(
        report(
          reviewedDevelopment({
            findings: [
              {
                version: "3.0.2",
                paths: ["apps__dump>eslint-config-next>example-dev"],
              },
            ],
          }),
        ),
        report(),
        now,
        developmentPolicy,
      ),
      "affected versions are 3.0.2",
    ),
  );
  assert.ok(
    has(
      check(
        report(
          reviewedDevelopment({
            findings: [
              { version: "3.0.3", paths: ["apps__dump>next>example-dev"] },
            ],
          }),
        ),
        report(),
        now,
        developmentPolicy,
      ),
      "unreviewed dependency: apps__dump>next>example-dev",
    ),
  );
});

test("a synthetic production exception fails on escalation, a fix or a new path", () => {
  assert.ok(
    has(
      check(
        report(parser({ severity: "high" })),
        report(prodParser({ severity: "high" })),
        now,
        productionPolicy,
      ),
      "example-parser",
      "severity is now high",
    ),
  );
  assert.ok(
    has(
      check(
        report(parser({ patched_versions: ">=1.1.4" })),
        report(prodParser()),
        now,
        productionPolicy,
      ),
      "example-parser",
      "a fix is now available",
    ),
  );
  const moved = parser({
    findings: [
      {
        version: "1.0.3",
        paths: ["apps__root>some-new-parser>example-parser"],
      },
    ],
  });
  const problems = check(report(moved), report(moved), now, productionPolicy);
  assert.ok(
    has(
      problems,
      "example-parser",
      "production path changed: apps__root>some-new-parser>example-parser",
    ),
  );
  assert.ok(has(problems, "example-parser", "unreviewed dependency"));
});

test("a synthetic production exception must stay in the reviewed class", () => {
  assert.ok(
    has(
      check(report(parser()), report(), now, productionPolicy),
      "example-parser",
      "no longer appears in the production audit",
    ),
  );
});

test("an expired exception fails and says to review it", () => {
  const problems = check(
    report(reviewedDevelopment()),
    report(),
    new Date("2026-12-07T00:00:00Z"),
    developmentPolicy,
  );
  assert.ok(has(problems, "example-dev", "expired on 2026-12-06; review it"));
  assert.deepEqual(
    check(
      report(reviewedDevelopment()),
      report(),
      new Date("2026-12-06T12:00:00Z"),
      developmentPolicy,
    ),
    [],
  );
});

test("an exception whose advisory disappeared is stale", () => {
  const problems = check(report(), report(), now, developmentPolicy);
  assert.ok(has(problems, "example-dev GHSA-example-dev", "stale exception"));
});

test("the withdrawn braces advisory is no longer excepted if reported again", () => {
  const problems = check(report(advisory()), report());
  assert.ok(has(problems, "braces GHSA-vfj7-8cjw-p6xm", "unreviewed"));
});

test("the withdrawn sprintf-js advisory is no longer excepted if reported again", () => {
  const withdrawn = parser({
    module_name: "sprintf-js",
    github_advisory_id: "GHSA-hp3w-g68c-fv3c",
  });
  const problems = check(report(withdrawn), report(withdrawn));
  assert.ok(has(problems, "sprintf-js GHSA-hp3w-g68c-fv3c", "unreviewed"));
});

test("a changed advisory identity is not the reviewed one", () => {
  const problems = check(
    report(reviewedDevelopment({ github_advisory_id: "GHSA-other" })),
    report(),
    now,
    developmentPolicy,
  );
  assert.ok(has(problems, "example-dev GHSA-other", "unreviewed"));
  assert.ok(has(problems, "example-dev GHSA-example-dev", "stale exception"));
});

test("an expiry beyond the review window is rejected", () => {
  const long = {
    ...developmentPolicy,
    exceptions: developmentPolicy.exceptions.map((e) => ({
      ...e,
      expires: "2027-03-01",
    })),
  };
  assert.ok(
    has(
      check(report(reviewedDevelopment()), report(), now, long),
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
  for (const withdrawn of ["GHSA-vfj7-8cjw-p6xm", "GHSA-hp3w-g68c-fv3c"]) {
    assert.ok(doc.includes(withdrawn), `${withdrawn} is not in the doc`);
  }
});
