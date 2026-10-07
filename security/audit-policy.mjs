// The pass/fail rules for `pnpm audit`, kept pure so they are tested with
// fixtures (audit-policy.test.mjs). `full` and `production` are the parsed JSON
// of `pnpm audit --json` and `pnpm audit --prod --json`; `policy` is
// security/audit-exceptions.json. Returns one line per problem, each naming the
// package, the advisory and the reason.

const DAY = 86_400_000;
const BLOCKING = new Set(["high", "critical"]);
const normal = (value) => (value === "medium" ? "moderate" : value);

function advisories(report) {
  return Object.values(report?.advisories ?? {}).map((a) => ({
    package: a.module_name,
    id: a.github_advisory_id ?? String(a.id),
    severity: normal(a.severity),
    patched: a.patched_versions ?? "None",
    versions: [...new Set(a.findings.map((f) => f.version))].sort(),
    paths: a.findings.flatMap((f) => f.paths),
  }));
}
const root = (path) => path.split(">")[1] ?? path;

export function evaluateAudit({ full, production, policy, now = new Date() }) {
  const problems = [];
  const fail = (a, why) => problems.push(`${a.package} ${a.id}: ${why}`);
  if (!full?.advisories || !production?.advisories)
    return ["pnpm audit returned no advisory data; the gate cannot judge it"];

  const all = advisories(full);
  const prod = advisories(production);
  const prodKeys = new Set(prod.map((a) => `${a.package} ${a.id}`));

  for (const a of prod)
    if (BLOCKING.has(a.severity))
      fail(a, `${a.severity} advisory in a production dependency path`);
  for (const a of all)
    if (a.severity === "critical" && !prodKeys.has(`${a.package} ${a.id}`))
      fail(a, "critical advisory");

  const matched = new Set();
  for (const a of all) {
    const exception = policy.exceptions.find(
      (e) => e.package === a.package && e.advisory === a.id,
    );
    if (!exception) {
      if (!BLOCKING.has(a.severity) || !prodKeys.has(`${a.package} ${a.id}`))
        fail(
          a,
          `unreviewed ${a.severity} advisory (versions ${a.versions.join(", ")}); fix it or review and add an exception`,
        );
      continue;
    }
    matched.add(exception);
    if (a.severity === "critical") continue; // already reported
    if (a.severity !== exception.severity)
      fail(
        a,
        `severity is now ${a.severity}, the exception was reviewed at ${exception.severity}`,
      );
    if (a.patched !== "None")
      fail(
        a,
        `a fix is now available (${a.patched}); upgrade and remove the exception`,
      );
    if (
      JSON.stringify(a.versions) !==
      JSON.stringify([...exception.versions].sort())
    )
      fail(
        a,
        `affected versions are ${a.versions.join(", ")}, the exception covers ${exception.versions.join(", ")}`,
      );
    for (const path of new Set(a.paths))
      if (!exception.reachedThrough.includes(root(path)))
        fail(a, `reached through an unreviewed dependency: ${path}`);

    const inProduction = prodKeys.has(`${a.package} ${a.id}`);
    if (inProduction !== exception.production)
      fail(
        a,
        exception.production
          ? "no longer appears in the production audit; update the exception"
          : "is now in a production dependency path; it was accepted as development-only",
      );
    if (inProduction) {
      const actual = [
        ...new Set(
          prod.find((p) => p.package === a.package && p.id === a.id).paths,
        ),
      ].sort();
      const expected = [...(exception.productionPaths ?? [])].sort();
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        fail(
          a,
          `production path changed: ${actual.join(" | ")} (reviewed: ${expected.join(" | ")})`,
        );
    }
    const expires = Date.parse(`${exception.expires}T23:59:59Z`);
    if (Number.isNaN(expires))
      fail(a, `the exception has no valid expiry date (${exception.expires})`);
    else if (now.getTime() > expires)
      fail(
        a,
        `the exception expired on ${exception.expires}; review it, then renew it deliberately or fix the dependency`,
      );
  }
  for (const exception of policy.exceptions) {
    if (!matched.has(exception))
      problems.push(
        `${exception.package} ${exception.advisory}: stale exception, the advisory is no longer reported; remove it`,
      );
    const limit = Date.parse(policy.decided) + policy.maxReviewDays * DAY;
    if (Date.parse(`${exception.expires}T00:00:00Z`) > limit)
      problems.push(
        `${exception.package} ${exception.advisory}: the expiry ${exception.expires} is more than ${policy.maxReviewDays} days after the decision ${policy.decided}`,
      );
  }
  return problems;
}
