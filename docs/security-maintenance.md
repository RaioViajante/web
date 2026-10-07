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

**Package (pnpm) version updates are intentionally not automated.** This
repository uses pnpm 12.8.1, and GitHub currently documents Dependabot pnpm
support only through v10, so no unsupported npm configuration, downgrade or other
updater is used. Dependency versions are reviewed by hand; this is not a security
gap: `pnpm audit:check` (every pull request, push and week) is what watches for
advisories. Re-evaluate when GitHub documents support for the pnpm version in use.

What Dependabot reads for the actions: its default for `/` is `.github/workflows`
plus an `action.yml` at the repository root, not `.github/actions/*`. The second
entry, `/.github/actions/*`, relies on the documented glob support of
`directories` to reach the composite action. That the glob finds it is not
confirmed until Dependabot's first run.

`dependabot.yml` is **version** updates. Dependabot **security updates** and
alerts are separate GitHub settings; see "Manual after push".

## CodeQL

`.github/workflows/codeql.yml`: `javascript-typescript`, `build-mode: none` (no
build of the monorepo), the default queries plus `security-extended`, on pull
requests, pushes to `main`, weekly (Wednesday 04:37 UTC) and manually. It is the
one workflow with write access, `security-events: write` to upload results, plus
`contents: read`; the CI workflow stays read-only and a test enforces both.
GitHub's template adds `packages: read` and `actions: read` for private or
internal repositories only. Its first real run happens on GitHub; nothing was run
locally.

**Prerequisite before relying on it:** an advanced workflow and GitHub's CodeQL
_default setup_ are alternatives (GitHub's switch from default to advanced means
disabling default setup). After the first push, in Settings > Advanced Security
(Code security) > CodeQL analysis, confirm the repository uses this workflow, not
default setup, and disable default setup if it is on.

Pull requests, as far as GitHub's documentation says:

- **Same-repository pull requests** run, with the job's `security-events: write`.
- **Dependabot pull requests** are same-repository and use the `pull_request`
  event, for which GitHub says code scanning always accepts the upload even though
  Dependabot's token is read-only. The documented trap is a Dependabot change
  _merged by squash_: the resulting push to `main` runs read-only and the upload
  fails; merge Dependabot pull requests with a merge commit or auto-merge as
  GitHub recommends.
- **External fork pull requests** are skipped by a job-level condition
  (`head.repo.full_name == github.repository`). They have a read-only token and
  the documentation I found does not say the upload is accepted for them, so
  they get no extra access and no `pull_request_target`; their code is analysed
  once merged. If GitHub confirms the upload works for forks, drop the condition.

CodeQL is **not** a required check yet. Require it only after its first run
succeeds and uploads, its behaviour on these pull requests is understood, and the
check name it actually emits is known; the name is not assumed here.

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
  `observational (non-blocking)` optional. Do **not** require CodeQL yet (see
  above).
- Check Settings > Advanced Security > CodeQL analysis: advanced workflow, not
  default setup.
- Enable Dependabot **security updates** and alerts, and secret scanning with push
  protection if available (Settings, Code security).
- Check that Actions is enabled with default workflow permissions read-only, and
  that Dependabot pull requests are merged with a merge commit (not squash).
- Look at the first Dependabot run for the composite action.
- The consolidated checklist, with the Vercel and live-host checks, is in
  [operations.md](operations.md).
