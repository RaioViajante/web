# Contributing

Thanks for taking a look. This is a personal project, so small, focused changes
and clear issues are the easiest to act on. For anything large, open an issue
first.

Security vulnerabilities do not belong in issues: see [SECURITY.md](SECURITY.md).

## Setup

- Node.js comes from [`.nvmrc`](.nvmrc) and pnpm from `packageManager` in
  [`package.json`](package.json).
- Install from the repository root: `pnpm install --frozen-lockfile`. Change the
  lockfile only through pnpm.
- Run one site: `pnpm --filter @raioviajante/<root|dump|docs|lab> dev`.

The layout is four apps in `apps/`, shared code in `packages/design`, and the
neutral `site/`, `seo/` and `security/` folders. What belongs where is in
[docs/architecture.md](docs/architecture.md); day-to-day commands are in
[docs/development.md](docs/development.md); the rules for working in the code
are in [AGENTS.md](AGENTS.md).

## Checking your change

Run what is relevant, and say in the pull request what you ran.

- **Documentation or content only:** `pnpm format:check`, and `pnpm links:check`
  after `pnpm build` when you touched links.
- **Code in one app:** that app's own scripts (which apps have which is in
  [docs/development.md](docs/development.md)), for example
  `pnpm --filter @raioviajante/dump test`.
- **Shared code (`packages/design`, `site/`, `seo/`, `security/`) or
  workspace/dependency changes:**
  `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate`.
- **Visual changes:** also look at desktop and mobile widths, keyboard focus and
  `pnpm browser:check`.

CI runs the full blocking set on every pull request; [docs/ci.md](docs/ci.md)
describes it. Expensive checks such as Lighthouse run there as non-blocking
signals, so you do not need to run them locally.

## Commits and pull requests

- Use [Conventional Commits](https://www.conventionalcommits.org/) in English,
  for example `fix(dump): keep the archive sorted`. Allowed types are the
  standard ones plus `content` for posts. CI checks the commits of each pull
  request.
- Check your commits locally with `pnpm commits:check`. To check each message as
  you commit, run `pnpm hooks:install` once; `pnpm hooks:uninstall` removes it.
  The hook is optional and sets only this repository's `core.hooksPath`.
- Keep a pull request to one purpose and avoid unrelated generated files.
  The pull request template lists what reviewers look for.

## Licenses

The repository is not under a single license. Code is MIT ([LICENSE](LICENSE));
the documentation content is CC BY 4.0; posts and the artwork and character
assets are all rights reserved. Each of those folders has its own `LICENSE`
file, and the [README](README.md) lists them.
