# Automated security maintenance

What runs without anyone asking, what blocks a merge, and what stays manual.
The CI layout is in `ci.md`; the rest of the security posture is in
`security-headers.md`, `security-txt.md` and `network-origins.md`.

## Dependency audit gate

`pnpm audit:check` (`security/audit-check.mjs`) runs `pnpm audit --json` for the
whole tree and for production dependencies and applies
`security/audit-exceptions.json`, the only place exceptions live. It needs the
registry, so it is **not** in the offline `pnpm validate`; CI runs it as the
separate blocking job `dependency-audit` and weekly (below).

It fails on: any critical advisory; any production HIGH (even an excepted one);
any advisory without an exception, at any severity; an exception whose advisory
no longer appears; a changed advisory id, severity or affected version; a new
dependency path; a fix that has become available; the exception being in the
wrong production/development class; and an expired exception. Missing audit data
fails too. The rules are pure code with fixture tests
(`security/audit-policy.test.mjs`).

### Temporary exceptions (decided 2026-10-07, expire 2026-12-06)

| Package            | Advisory            | Severity | Class                 | Why accepted                                                                                                                                                                                            |
| ------------------ | ------------------- | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `braces` 3.0.3     | GHSA-vfj7-8cjw-p6xm | high     | development only      | Reached only through ESLint's glob matching (`eslint-config-next`, `eslint-plugin-astro`); no fixed release exists. Must never appear in a production path.                                             |
| `sprintf-js` 1.0.3 | GHSA-hp3w-g68c-fv3c | moderate | production-classified | Reached in production only as `apps/dump > gray-matter > js-yaml > argparse > sprintf-js`, which parses the repository's own post frontmatter; no fixed release exists; below the production HIGH gate. |

Neither is a permanent waiver. Both expire together, 60 days after the decision.
When the date passes, the gate fails and a person must review: fix or upgrade
the dependency, or renew deliberately by editing the date in the JSON (never more
than 60 days after a new decision date). Nothing extends it automatically.

## Dependabot

`.github/dependabot.yml` updates **GitHub Actions** weekly, in the workflows and
the local composite action. The pins are full SHAs with a `# vX.Y.Z` comment and
Dependabot rewrites both; minor and patch updates share one pull request, majors
stay separate, at most five open, no auto-merge, labels or reviewers.

The **npm/pnpm ecosystem is not configured**, on purpose: GitHub documents
Dependabot support for pnpm 7 to 10, and this repository uses pnpm 12 with a
`pnpm-workspace.yaml` holding overrides and `minimumReleaseAge` (which has made
Dependabot pull requests fail in pnpm 11 projects). Add it only after checking a
real Dependabot run against the lockfile, or move to Renovate; it needs a decision.

`dependabot.yml` is **version** updates. Dependabot **security updates** and
alerts are separate GitHub settings; see "Manual after push".

## CodeQL

`.github/workflows/codeql.yml`: `javascript-typescript`, `build-mode: none` (no
build of the monorepo), the default queries plus `security-extended`, on pull
requests, pushes to `main`, weekly (Wednesday 04:37 UTC) and manually. It is the
one workflow with write access, `security-events: write` to upload results, plus
`contents: read`; the CI workflow stays read-only and a test enforces both.
GitHub's template adds `packages: read` and `actions: read` for private or
internal repositories only. Pull requests from forks and from Dependabot get a
read-only token, where the upload can fail with "Resource not accessible by
integration"; that is GitHub's restriction and the permissions are not widened
for it. Its first real run happens on GitHub; nothing was run locally.

## Scheduled maintenance

`.github/workflows/security-maintenance.yml`, weekly on Monday 06:17 UTC and
manually, read-only, no secrets, nothing regenerated or committed:

- `node security/sync-vercel.mjs --check`: fails if a `security.txt` differs from
  its source or its `Expires` is past, inside the 30-day window or too far ahead.
- `pnpm audit:check`: catches a new advisory, a fix for an accepted one, or an
  exception reaching its date, even with no commits.

**Limit:** GitHub disables scheduled workflows in a public repository after
about 60 days without repository activity, so this is not a guarantee. Review by
hand: `security.txt` (`Expires` 2027-10-01) before its renewal window opens on
2027-09-01, and the exceptions before 2026-12-06, whether or not Actions still
runs. No bot files issues; that would need write access and would stop with the
schedule.

## Workflow policy

`security/workflows.test.mjs` (in `pnpm security:check`) scans every workflow and
composite action: full-SHA pins with version comments, no `pull_request_target`,
write access only for CodeQL's `security-events`, read-only top-level
permissions, concurrency, timeouts, off-peak weekly schedules, no secrets, no
event text in shell, checkout without persisted credentials, no audit
suppression.

## After the first push (manual, remote)

- Require the checks **`quality`** and **`dependency-audit`**; leave
  `observational (non-blocking)` optional. Decide whether to require the CodeQL
  check (`analyze (javascript-typescript)`) after seeing its first runs, including
  how it behaves on Dependabot and fork pull requests.
- Enable Dependabot **security updates** and alerts, and secret scanning with push
  protection if available (Settings, Code security).
- Check that Actions is enabled with default workflow permissions read-only.
- Decide the pnpm Dependabot question above.
- Developer-workflow polish such as commit hooks is Phase 11, not here.
