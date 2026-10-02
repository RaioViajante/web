# AGENTS.md

Repository-wide instructions for coding agents working in RaioViajante/web.

Precedence:

1. This file applies everywhere in the repository.
2. An app's own `AGENTS.md` adds app-specific instructions.
3. Explicit instructions from the user for a task override these defaults.

## Repository

| Path              | Package                | Role                            |
| ----------------- | ---------------------- | ------------------------------- |
| `apps/root`       | `@raioviajante/root`   | personal home, ecosystem index  |
| `apps/dump`       | `@raioviajante/dump`   | personal technical writing      |
| `apps/docs`       | `@raioviajante/docs`   | curated technical documentation |
| `apps/lab`        | `@raioviajante/lab`    | interactive experiments         |
| `packages/design` | `@raioviajante/design` | shared color tokens (CSS)       |

- The apps are deployed independently. Apps must not import from one another.
- Shared code lives in `packages/`. Move code there only when it has a real
  shared responsibility. Apps may depend on packages; packages never depend on
  apps.
- Repository-level documentation lives in `docs/`; each app has its own `docs/`.
- `apps/root`, `apps/docs`, and `apps/lab` have their own `AGENTS.md`.
  `apps/dump` has none committed: the `AGENTS.md` and `CLAUDE.md` that Next.js
  generates there are intentionally gitignored.

## Language

Use English for source code, identifiers, comments, documentation, commit
messages, package metadata, and GitHub metadata. This applies to repository
content, not to conversation with the user. Do not rewrite existing content only
to enforce it.

## Package management

- pnpm only, version 12.8.1 (`packageManager`). Node 24, pinned in `.nvmrc`.
- One root `pnpm-workspace.yaml` and one root `pnpm-lock.yaml`. Do not add
  per-app lockfiles, `package-lock.json`, or `yarn.lock`.
- Change `pnpm-lock.yaml` only through pnpm commands, never by hand.
- Prefer running from the repository root with named filters:
  `pnpm --filter @raioviajante/<app> <script>`.
- Dependency changes must be intentional and scoped to the task. Apps may
  intentionally use different versions of the same dependency (TypeScript
  included); do not unify versions just for consistency.
- Packages with install scripts must be listed under `allowBuilds` in
  `pnpm-workspace.yaml`; pnpm fails the install otherwise.

## Change scope

- Inspect the relevant code and documentation before modifying anything.
- Keep changes focused on the task. Do not refactor or restyle other apps
  unless the task requires it.
- Avoid cross-app abstractions without real reuse. A shared abstraction
  normally needs at least two real consumers, or a clear architectural reason.

## Design

- root, dump, docs, and lab share the broader RaioViajante identity. They are
  not required to be pixel-identical; each app implements it for its framework.
- Shared design code should come from proven reuse. `@raioviajante/design`
  provides only the five shared color primitives (`--rv-color-*` in
  `tokens.css`). lab is its only consumer; root, dump, and docs are not.
- A consuming app keeps its own semantic aliases (for example
  `--bg: var(--rv-color-bg)`) and its app-specific tokens. Selectors, focus and
  selection rules, theme bootstrap, typography, layout, width, and gutter stay
  in each app.
- Play is planned separately and must not automatically inherit the
  RaioViajante shared design package.
- Do not default to generic SaaS layouts, card-heavy dashboards, bento grids,
  gratuitous gradients, decorative blobs, or glassmorphism.

## Documentation honesty

- Distinguish what is implemented, designed, planned, or experimental. Never
  document planned behavior as implemented.
- Do not claim deployments, CI runs, packages, or repository archival that have
  not actually happened.
- When unsure about the current state, inspect the repository or the relevant
  infrastructure before writing about it.

## Validation

Run the checks each affected app defines; the minimum should match the scope of
the change.

| App  | Commands (`pnpm --filter @raioviajante/<app> …`)     |
| ---- | ---------------------------------------------------- |
| root | `format:check`, `lint`, `typecheck`, `build`         |
| dump | `format:check`, `lint`, `typecheck`, `test`, `build` |
| docs | `typecheck`, `build`                                 |
| lab  | `format:check`, `lint`, `typecheck`, `build`         |

docs has no lint, format, or test scripts; do not invent them. For changes that
span apps or touch workspace configuration, run everything:

```sh
NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate
```

Report checks exactly as run; do not claim checks that did not run.

## Git

- Conventional Commits, in English, one coherent change per commit. Do not mix
  unrelated cleanup into a commit.
- Commit after meaningful, validated progress. Review the staged diff before
  committing.
- Never push unless the user explicitly authorizes it. Never force-push without
  explicit authorization.
- The app histories were imported with rewritten SHAs on purpose. Do not rewrite
  the imported commits, and do not move or recreate the tags `import/root`,
  `import/dump`, `import/docs`, or `import/lab`.

## Production infrastructure

- Each app is its own Vercel project, with Root Directory `apps/root`,
  `apps/dump`, `apps/docs`, or `apps/lab`. See `docs/deployment.md` for the
  current configuration.
- Vercel project settings, domains, environment variables, and Ignored Build
  Step commands are production infrastructure. Do not change them unless the
  user explicitly asks.
- Before an app starts consuming a package from `packages/`, its Ignored Build
  Step must already list that package's path (for example
  `../../packages/design`). Today only lab's does.
- `NEXT_PUBLIC_SITE_URL` (dump) is public configuration, not a secret.
- Do not describe a rollout as live until production actually runs it.

## Generated files

Do not edit these by hand:

- `pnpm-lock.yaml` (changes only through pnpm)
- `node_modules/`, `.next/`, `dist/`, `.astro/`, `coverage/`
- `*.tsbuildinfo`, and framework-generated `next-env.d.ts`
