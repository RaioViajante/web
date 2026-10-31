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

### Temporary exceptions

There is currently one dependency-audit exception, reviewed on 2026-10-29 and
expiring 2026-12-28: `deepmerge` 4.3.1 (GHSA-gcqx-w48m-w2h4, low, prototype
poisoning in `mergeObject()`). Only Jest's `jest-config` reaches it, in dump's
test tooling; `pnpm audit --prod` reports no production path. 4.3.1 is the latest
release and the advisory has no patched version, so there is nothing to upgrade.

Any exception is not a permanent waiver. It must expire no more than 60
days after its decision. When the date passes, the gate fails and a person must
review: fix or upgrade the dependency, or renew deliberately by editing the
decision and expiry in the JSON. Nothing extends an exception automatically.

### minimatch and glob (October 2026)

**What was reported.** On 2026-10-30 two moderate advisories were published, and
`dependency-audit` failed on every branch. Neither reaches production
(`pnpm audit --prod` is empty); both reach only development tooling.

- GHSA-g3hv-75wg-m249, minimatch, affected `< 11.0.1`: input-controlled growth
  of `globParts` in `firstPhasePreProcess()` when `optimizationLevel` is 2 or
  higher. It was reported for 10.2.6, 9.0.9 and 3.1.5 in the lockfile.
- GHSA-3g3m-2fjr-6pw4, glob, affected `>= 9.0.0, <= 14.0.1`: an `AbortSignal`
  cancellation bypass. It was reported for 10.5.0 and 13.0.6.

**Remediation.** `pnpm-workspace.yaml` replaces the vulnerable releases with
minimatch 11.0.3 and glob 14.0.3 (published, integrity-checked npm releases,
at or above the fixed versions). No exception was added to
`security/audit-exceptions.json`.

- minimatch 9 and 10 and glob 10 and 13 are overridden directly. Their consumers
  (typescript-estree, glob, test-exclude, Jest) use only the named exports that
  minimatch 11 keeps, and no release of those packages asks for a patched range.
- minimatch 3.1.5 cannot be overridden directly. Its consumers (eslint 9,
  `@eslint/config-array`, `@eslint/eslintrc`, `eslint-plugin-import`,
  `-jsx-a11y` and `-react`) call the module itself, and minimatch 11 has named
  exports only, no default export, and is not callable. The newest eslint still
  asks for `^10.2.x`, which is also affected, so there is no upstream release to
  wait for. The override `minimatch@3.1.5` therefore points at
  `security/minimatch-compat`.

**The shim.** `security/minimatch-compat` is a private package whose entire code
is `module.exports = require("minimatch-modern").minimatch`, where
`minimatch-modern` is `npm:minimatch@11.0.3`. It is a compatibility wrapper, not
a reimplementation: every match, expansion and preprocessing step runs in the
published minimatch 11.0.3. Its `minimatch` function carries `Minimatch`,
`filter`, `match`, `braceExpand`, `sep`, `GLOBSTAR`, `defaults`, `escape` and
`unescape`, which is what the consumers use. The audit now reports the
dependency as minimatch 11.0.3. That is a replacement of the dependency by a
wrapper over a patched release, not an upstream fix of 3.1.5, and it says
nothing about vulnerabilities in other glob or pattern code.

**Why 3.1.5 did not contain the examined code path.** The advisory's affected
range covers every release below 11.0.1, but the vulnerable function
`firstPhasePreProcess` and the `optimizationLevel` option do not exist in the
3.1.5 source, and passing `optimizationLevel: 2` to it has no effect. That was
checked by reading the source and by a bounded reproduction (separate process,
256 MB heap, 20 s deadline) using the pattern from the upstream fix's test: 10.2.6
built 256, 1,024, 4,096 and 8,192 pattern sets for 8, 10, 12 and 13 repetitions,
3.1.5 built one, and 11.0.3 and the shim stop at the `braceExpandMax` limit. None
of eslint, `@eslint/config-array`, `@eslint/eslintrc` or the three plugins sets
`optimizationLevel`; the default is 1. Replacing 3.1.5 removes a release the
audit flags without evidence of exposure, and puts the code with the upstream
fix in its place. The 11.0.3 fix bounds the work (it caps the set at
`braceExpandMax`, 100,000 by default, and skips the quadratic comparison above
1,000 sets); it does not make an unusually large pattern free.

**Verified compatibility.** Against minimatch 3.1.5 itself, the callable form
agreed in 5,730 of 5,733 combinations of 21 patterns, 21 paths and 13 option
sets, and the `Minimatch` class used by eslint, eslintrc and config-array agreed
in 1,323 of 1,323. The three differences are `!(a|b)*` with `nonegate: true`,
which no config here sets. With the exact ESLint 9.39.5 and plugin versions,
seven of the eight plugin rules that call minimatch gave the same findings as
with 3.1.5. `pnpm lint`, the unit tests, the builds, the browser suite and the
performance budgets pass. `security/minimatch-compat.test.mjs` keeps this from
regressing: it resolves `minimatch` the way eslint does and checks the version,
the call shape, 21 results taken from 3.1.5, and the patched preprocessing limit
in a child process.

**Remaining incompatibilities.**

- minimatch 11 has no `makeRe`, so the shim has none. `eslint-plugin-import`'s
  `import/no-internal-modules` rule calls `minimatch.makeRe` and fails to load
  with `makeRe is not a function` if it is enabled with `allow` or `forbid`. No
  app config enables it. A faithful `makeRe` would mean re-implementing 3.x's
  regular-expression builder, so none was added; a stand-in that only loaded the
  rule would hide wrong results. The test above records the gap.
- `nonegate: true` with a leading extglob negation (`!(...)`) differs, as above.

**Maintenance.**

- Whoever changes eslint, `eslint-config-next` or the three plugins runs
  `pnpm audit:check` and `pnpm lint` afterwards. If a dependency now asks for a
  different minimatch 3 release, the override no longer matches it and the audit
  fails, which is the intended behaviour.
- Editing the shim needs `pnpm install` again, because `file:` copies it, and
  it has no integrity hash: review it like code.
- The shim brings in minimatch 11's own transitive dependencies, among them
  `@isaacs/nonrecursive-glob-match`, first published 2026-10-26 and accepted
  under the default release-age policy.
- Any new advisory for minimatch 11 or glob 14 is reported by the audit, since
  those are the versions in the tree.

**Remove the shim and the `minimatch@3.1.5` override** when eslint and the
plugins ask for minimatch 11 or later (or stop using it), after which the
remaining minimatch and glob overrides can be reviewed one by one. Watch
[eslint/eslint](https://github.com/eslint/eslint),
[eslint/eslintrc](https://github.com/eslint/eslintrc),
[eslint/rewrite](https://github.com/eslint/rewrite) (`@eslint/config-array`),
[import-js/eslint-plugin-import](https://github.com/import-js/eslint-plugin-import),
[jsx-eslint/eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react),
[jsx-eslint/eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
and [isaacs/minimatch](https://github.com/isaacs/minimatch).

The former `satori` advisory (GHSA-wx4j-mvgx-mqwp, SVG escaping, fixed in
0.33.5) is not an exception: `@vercel/og` 0.11.1 pins `satori` 0.25.0 exactly, so
a `pnpm-workspace.yaml` override moves it to 0.33.5. The generated social images
of docs and lab were compared before and after and are byte for byte identical.
Remove the override when `@vercel/og` ships the fix on a version this repository
can use.

The former `braces` exception (GHSA-vfj7-8cjw-p6xm) was removed after GitHub
[withdrew the advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) on
2026-10-23 because it was not practically exploitable. It is no longer reported
by the full or production pnpm audit. The lockfile still includes `braces` 3.0.3
only through development ESLint tooling (`eslint-config-next` and
`eslint-plugin-astro`); `pnpm audit --prod` and `pnpm --prod why braces` report
no production path. Version 3.0.3 remains the latest release, so there is no
patched dependency update to make. The gate still fails on any new advisory,
including a future one for this package.

The former `sprintf-js` exception (GHSA-hp3w-g68c-fv3c) was removed after
GitHub [withdrew the advisory](https://github.com/advisories/GHSA-hp3w-g68c-fv3c)
on 2026-10-22. It is no longer reported by the full or production pnpm audit;
the lockfile still includes `sprintf-js` 1.0.3 through dump's `gray-matter >
js-yaml > argparse` and Jest's development tooling. There is no patched
`sprintf-js` release or dependency upgrade for this withdrawn advisory. The
gate still fails on any new advisory, including a future one for this package.

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
`directories` to reach the composite action. Dependabot's first run
(2026-10-07) updated the `/.github/actions/setup` directory, so the glob reaches
it.

`dependabot.yml` is **version** updates. Dependabot **security updates** and
alerts are separate GitHub settings. Current, intentional state: Dependabot
alerts are enabled and Dependabot security updates are disabled.

## CodeQL

`.github/workflows/codeql.yml`: `javascript-typescript`, `build-mode: none` (no
build of the monorepo), the default queries plus `security-extended`, on pull
requests, pushes to `main`, weekly (Wednesday 04:37 UTC) and manually. It is the
one workflow with write access, `security-events: write` to upload results, plus
`contents: read`; the CI workflow stays read-only and a test enforces both.
GitHub's template adds `packages: read` and `actions: read` for private or
internal repositories only. It runs on GitHub, not locally.

**The setting it relies on:** an advanced workflow and GitHub's CodeQL _default
setup_ are alternatives (GitHub's switch from default to advanced means disabling
default setup). Settings > Advanced Security (Code security) > CodeQL analysis
must use this workflow, with default setup off; [operations.md](operations.md)
records the current settings.

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

CodeQL is **not** a required check. Making it one is a separate decision: only
once its behaviour on these pull requests is understood and the check name it
actually emits is known; the name is not assumed here.

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
2027-09-01, and the exceptions before 2026-12-28, whether or not Actions still
runs. No bot files issues; that would need write access and would stop with the
schedule.

## Workflow policy

`security/workflows.test.mjs` (in `pnpm security:check`) scans every workflow and
composite action: full-SHA pins with version comments, no `pull_request_target`,
write access only for CodeQL's `security-events`, read-only top-level
permissions, concurrency, timeouts, off-peak weekly schedules, no secrets, no
event text in shell, checkout without persisted credentials, no audit
suppression.

## Repository settings (manual, remote)

These live in GitHub, not in the repository. The intended configuration
([operations.md](operations.md) records what has been checked):

- The checks **`quality`** and **`dependency-audit`** are required;
  `observational (non-blocking)` and CodeQL are not (see above).
- Settings > Advanced Security > CodeQL analysis uses the advanced workflow, not
  default setup.
- Dependabot **alerts** are enabled and Dependabot **security updates** disabled
  (the intentional state), with secret scanning and push protection where
  available (Settings, Code security).
- Actions is enabled with read-only default workflow permissions, and Dependabot
  pull requests are merged with a merge commit (not squash).
- The consolidated checklist and the current verification state, with the
  Vercel and live-host checks, are in [operations.md](operations.md).
