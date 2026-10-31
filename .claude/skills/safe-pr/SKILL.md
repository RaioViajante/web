---
name: safe-pr
description: Git, worktree, commit, pull request and CI workflow for the RaioViajante/web monorepo. Use before creating a branch or worktree, committing, pushing, opening or updating a PR, resolving conflicts, judging whether CI is green, or when asked to merge. Covers concurrent Claude sessions, exact-HEAD CI verification, stale preview servers and merge authorization.
argument-hint: "[branch or PR number]"
---

# safe-pr

Procedure for changing this repository without disturbing other work. It adds
process on top of `AGENTS.md`, `docs/ci.md`, `docs/operations.md` and
`docs/development.md`; read those for the rules themselves. Skills are
instructions, not enforcement: the GitHub ruleset on `main` and CI stay
authoritative. Never work around them.

## 1. Preflight (read-only, always first)

```sh
git status --short --branch
git worktree list
git branch -vv
git fetch origin
git rev-parse origin/main main
git log --oneline -5 origin/main
gh pr list --state open
```

- `origin/main` after the fetch is the truth. A SHA quoted in a prompt, a memory
  or a doc is a hint only.
- Record the uncommitted files you did not create (for example `reference/`).
  They are not yours: leave them untouched and unstaged.
- Update local `main` only with `git merge --ff-only origin/main`. If it cannot
  fast-forward, or the primary checkout is dirty or on another branch, do not
  reset, force checkout or clean. Base an isolated worktree on `origin/main`.

## 2. Worktree and session ownership

- This repository keeps many sibling worktrees (`../web-*`). Each belongs to a
  branch and possibly to another running session. Treat every worktree you did
  not create in this session as owned by someone else.
- Create your own: `git worktree add -b <branch> ../web-<topic> origin/main`.
  Work and run commands only inside it (use absolute paths; a `cd` in a shell
  call does not persist reliably).
- Before touching an existing worktree or branch the task names, run
  `git -C <path> status --short --branch` and `git -C <path> log -3 --oneline`.
  Uncommitted changes, a moving HEAD or a lock (`git worktree list` shows
  `locked`) mean another agent is active: stop and ask. Never stash, reset,
  rebase, checkout over or delete files in a worktree you do not own.
- Never `git worktree remove`, `git branch -D`, `git clean` or `git reset --hard`
  anything you did not create, and avoid them on your own work unless the state
  is verified pushed or disposable.
- One branch per task, scoped to what the task names. Another app's files, the
  lockfile and generated files stay out unless the task requires them.

## 3. Changes and commits

- Read the app's `AGENTS.md` and the docs it links before editing.
- Stage explicit paths (`git add path/...`), never `git add -A` or `.`. Review
  `git diff --cached --stat` and the diff before each commit.
- Conventional Commits in English: `type(scope): imperative summary`. Types are
  the commitlint-conventional set plus `content` for posts
  (`commitlint.config.mjs`). Scopes in recent history are app names (`docs`,
  `lab`, `dump`, `root`), `design`, `security`, `seo`. Check with
  `pnpm commits:check`. Add any attribution trailer the session instructs.
- Commit meaningful validated progress; do not amend or force-push published
  commits unless the user asked.
- Imported history and tags (`import/root`, `import/dump`, `import/docs`,
  `import/lab`) are never rewritten.

## 4. Choose and run validation

Tell the user exactly which checks ran; never imply the rest did.

| Change touches                                                       | Minimum                                                                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| One app only                                                         | that app's scripts from the `AGENTS.md` table (`pnpm --filter @raioviajante/<app> ...`)                 |
| `packages/design`, `site/`, `seo/`, `security/`, workflows, lockfile | `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate`                                      |
| Rendered UI                                                          | the above plus `pnpm browser:check` and a desktop (1440) and mobile (390) look, keyboard included       |
| Markdown or skills only                                              | `pnpm commits:check` and a format check where a formatter covers the path; say that no app code changed |

Remember `docs` has no lint or format scripts. Read failures; do not weaken a
budget, test or gate to get green.

### Preview and test servers

- Never reuse a server you did not start. Something already listening on 3000,
  4321 or 4322 may serve another worktree's build.
- `pnpm browser:check`, `seo:verify`, `perf:check` and `links:check` reuse servers
  already listening on the usual ports (`docs/browser-checks.md`). Check that
  3001, 3002, 4321 and 4322 are free first (`lsof -iTCP -sTCP:LISTEN -nP`); a
  listener you did not start may serve another worktree's build.
- Start your own on a free port, from your own worktree, after your own build.
  Prove identity before testing: compare a build-specific marker (a string or
  asset hash you just changed, the sitemap contents) between your build output
  and the response. Stale server means invalid result.
- Stop only the processes you started.

## 5. Independent review

Before the PR leaves draft, have a reviewer other than the author read the final
diff: the `code-review` skill or a fresh subagent with no authoring context.
Give it the diff and the task statement, not your conclusions. Fix findings that
are real, re-run the affected checks, and report findings you declined with
reasons. Review of an earlier HEAD does not cover later commits.

## 6. Push and PR

- Push only when the task or user authorizes it, and only the task's branch.
  Authorization to push a feature branch is not authorization to merge or to
  push `main`.
- Open the PR against `main` as a draft unless told otherwise. Body: what
  changed and why, files by area, checks actually run with results, known gaps.
  Add the PR attribution line the session instructs.

## 7. CI: the exact HEAD

A green check proves only the commit it ran on.

```sh
HEAD=$(git rev-parse HEAD)
gh pr view <n> --json headRefOid,mergeStateStatus,isDraft,reviewDecision
gh pr checks <n>
gh run list --branch <branch> --json headSha,status,conclusion,name
```

- `headRefOid` on GitHub must equal your local `HEAD`, and each run's `headSha`
  must equal it. After any push, earlier results are void until the new runs
  finish. A newer push cancels the older run (`docs/ci.md`), so "cancelled" on
  an old SHA is expected, not a failure to investigate.
- Required checks are `quality` and `dependency-audit` (`docs/ci.md`, "Required
  checks"). `observational (non-blocking)` and CodeQL are informational; report
  them but do not treat them as the gate or as proof.
- Do not skip, rerun-until-green without reading the log, mark checks optional,
  edit workflows to pass, use `--admin`, or merge through a failing required
  check. A red `quality` is read from its log
  (`gh run view <id> --log-failed`) and fixed at the cause. A red
  `dependency-audit` with no new commit may be a new advisory: follow
  `docs/security-maintenance.md`, do not add exceptions on your own.
- Check the ruleset when in doubt: `gh api repos/RaioViajante/web/rulesets`.

## 8. Conflicts and stale branches

- Prefer `git merge origin/main` into the feature branch (history here uses
  merge commits); do not rebase a branch that is pushed or shared unless asked.
- Resolve by understanding both sides. In `pnpm-lock.yaml` re-resolve with pnpm,
  never by hand. In generated files (`published-routes.generated.ts`, icons,
  `security.txt` copies) regenerate with the documented script.
- After resolving, re-run the checks from section 4 and wait for CI on the new HEAD.

## 9. Merge authorization

Merging needs explicit, current authorization from the user for that PR. Earlier
approval of the work, "looks good" or a request to open a PR is not enough.
Without it, stop at "ready to merge", with the HEAD SHA and the check evidence.
When authorized: confirm section 7 on the exact HEAD, use the merge method the
user named (Dependabot PRs: merge commit, never squash), and merge only that PR.

## 10. After merge

A merge is Git integration, not production. Vercel deploys separately and may
cancel a project through the Ignored Build Step. Record the merge commit SHA, the
post-merge `main` CI result, and hand over to the `release-audit` skill for
anything that must be confirmed live. Do not claim "deployed" from a merged PR.
Leave the worktree and branch in place unless the user asks for cleanup.
