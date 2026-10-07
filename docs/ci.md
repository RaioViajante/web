# Continuous integration

`.github/workflows/ci.yml` has three jobs of two kinds, next to the CodeQL and
scheduled security workflows described in `security-maintenance.md`. It validates
only; Vercel alone deploys. It uses no secrets, so it runs the same for pull
requests from forks.

## Triggers, concurrency, permissions

- **Triggers:** `pull_request`, push to `main`, and `workflow_dispatch`. Never
  `pull_request_target`. There are no path filters: shared packages and top-level
  tooling (`packages/design`, `security/`, `seo/`, `perf/`, `links/`, `e2e/`) feed
  every app, and a filter that skips a needed run costs more than the runner
  minutes it saves.
- **Concurrency:** a newer push to the same pull request cancels the older run
  (`cancel-in-progress: true`, group per PR ref). Runs for `main` and manual runs
  are grouped by commit, so a newer `main` commit never cancels an older one's
  validation.
- **Permissions:** the workflow is `contents: read` and nothing else; no job
  widens it. Checkout uses `persist-credentials: false`, so the token is not left
  in `.git`.
- **Untrusted input:** nothing from the event (titles, branch names, commit
  messages) is used. No `${{ }}` expression appears inside any `run:` block;
  values reach scripts only through `env:`.

## Jobs

**`quality`: the blocking gate.** Require this exact check name in branch
protection (see "After the first push"). Deterministic, under repository control,
30-minute timeout, no retries. In order:

1. `pnpm validate`: format, lint, typecheck, tests, the build of all four apps,
   `pnpm security:check` (headers, security.txt, storage, origin policy, site
   origins, **workflow policy**) and `pnpm seo:check`. The next steps use these builds.
2. `pnpm browser:check`: Playwright and axe in Chromium, 1440 and 390 px.
3. `pnpm seo:verify`: the SEO contract over HTTP.
4. `node security/verify-http.mjs`: headers and CSP over HTTP.
5. `ORIGINS_SKIP_THIRD_PARTY=1 pnpm security:origins`: the Firefox origin check
   without third-party traffic.
6. `pnpm perf:check`: page-weight budgets and image/font rules.
7. `pnpm links:check`: internal links and first-party resources.

**`dependency-audit`: also blocking.** `pnpm audit:check`, 15-minute timeout,
read-only, no secrets, independent of `quality`. Unlike `quality` it is not
deterministic: it asks the package registry about advisories, so it can start
failing with no commit (a new advisory, a fix for an accepted one, an exception
reaching its date; see `security-maintenance.md`). Require it as well.

**`observational (non-blocking)`: never required.** Runs after `quality`
passes, with its own isolated build, and is allowed to fail without failing the
workflow (`continue-on-error` on the job and on each check, plus a summary and
a `::warning` annotation per check that did not succeed):

- `pnpm perf:lighthouse`: synthetic Lighthouse varies with the machine. Its policy
  is unchanged: hard floor 90, quality target 95, one narrow `NO_LCP` exception
  proved by an independent browser observation (`docs/performance.md`).
- `pnpm security:origins`: also visits giscus.app, so it depends on a third
  party being reachable. Parent-page policy still applies; it just cannot gate a merge.
- `pnpm links:external`: remote sites rate-limit, block bots and go down.

## Setup (shared by both jobs)

`.github/actions/setup` pins nothing itself: Node comes from `.nvmrc`, pnpm from
`package.json#packageManager`, the install is `pnpm install --frozen-lockfile`.

- **Cache:** `setup-node`'s pnpm store cache, keyed on `pnpm-lock.yaml`. Never
  `node_modules` or build output: every run builds and tests the commit itself.
- **Chromium:** `pnpm exec playwright install --with-deps chromium` every run.
  Not cached: it is a small download next to the suite, and a fresh install cannot
  leave a stale browser behind a Playwright upgrade.
- **Firefox:** the origin check drives Firefox over WebDriver BiDi, so a pinned
  `browser-actions/setup-firefox` installs 157.0.1 and the check reads it from
  `FIREFOX_BIN`. Bump it deliberately.

## Action pinning

Every external action, in the workflow and in the composite action, is pinned to
a full commit SHA with a `# vX.Y.Z` comment, verified against the upstream tag:

| Action                          | Version | Commit                                     |
| ------------------------------- | ------- | ------------------------------------------ |
| `actions/checkout`              | v7.0.1  | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node`            | v7.0.0  | `820762786026740c76f36085b0efc47a31fe5020` |
| `pnpm/action-setup`             | v6.1.0  | `ea17c68df8912ef543352723c149a84f56e3d413` |
| `actions/upload-artifact`       | v7.0.1  | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` |
| `browser-actions/setup-firefox` | v1.7.2  | `0bc507ddf224827e3b1af68e014d5e42ab93e795` |

(`pnpm/action-setup` and `browser-actions/setup-firefox` tag annotated objects;
the pinned value is the commit the tag points to.)

## Failure artifacts

On failure `quality` uploads `e2e/.results` (screenshots, traces) and
`perf/.results`; `observational` always uploads `perf/.results` (the Lighthouse
reports). Only existing paths, 7 days, never `node_modules` or builds.

## Guard

`security/workflows.test.mjs` runs in `pnpm security:check`, so in
`pnpm validate`, and fails if any workflow or action: uses an action not pinned to
a 40-character SHA with a version comment; uses `pull_request_target`,
`write-all`, any `write` permission or `id-token`/`security-events`; widens the
read-only permissions, drops the concurrency cancellation or a job timeout;
keeps checkout credentials; puts an expression in a `run:` block; puts
`perf:lighthouse` or `links:external` in the blocking job; lets the blocking
origin check reach third parties; or loosens the frozen install.

## What is and is not verified

Verified locally: the YAML parses, the policy test passes (and fails against
mutated copies), and every blocking command passes on the local builds. The
blocking commands also passed in an Ubuntu 24.04 container (arm64, Node 24.20.0,
pnpm 12.8.1, Playwright's Chromium with its system packages, and the Firefox
157.0.1 tarball). That run found a real Linux problem, now fixed: Node cannot
resolve `*.localhost` names (Firefox can), and `verify-http` expected servers to
be started already. **Not verified until the workflow runs on GitHub:** the
x64 runner image, the setup actions (including that `setup-firefox`'s download
finds the GTK libraries the runner image ships), `--with-deps` on that image,
and real timings.

## After the first push (manual, remote)

Mark the checks named **`quality`** and **`dependency-audit`** as required
(branch protection or a ruleset).
Leave `observational (non-blocking)` unrequired. The remaining manual settings
are listed in `security-maintenance.md`.
