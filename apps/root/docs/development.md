# Development

## Requirements and commands

Use Node.js 24 or newer and pnpm 12.8.1 (recorded in `package.json`).
Run these commands from `apps/root`, or from the monorepo root as
`pnpm --filter @raioviajante/root <script>`; see the repository-level
[development guide](../../../docs/development.md).

| Command             | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `pnpm install`      | Install dependencies from the manifest and lockfile.   |
| `pnpm dev`          | Start the development server at http://localhost:3000. |
| `pnpm lint`         | Run ESLint.                                            |
| `pnpm typecheck`    | Generate Next.js route types and check TypeScript.     |
| `pnpm format:check` | Check formatting with Prettier.                        |
| `pnpm format`       | Apply Prettier formatting.                             |
| `pnpm build`        | Create the production build.                           |
| `pnpm start`        | Serve the production build after `pnpm build`.         |

## Structure and conventions

- `app/layout.tsx` defines the root document, metadata, and shared shell;
  `app/page.tsx` renders the index and its recent writing section.
- Use Next.js App Router, React, TypeScript, and pnpm. Keep architecture simple
  and dependencies minimal; add tools only when needed.
- Use ESLint and Prettier for linting and formatting. Write repository content in
  English. ESLint 9 is retained for compatibility with Next.js's bundled plugins;
  pnpm reports its upstream deprecation notice. Upgrade when those plugins support
  ESLint 10.
- Inspect existing work before editing. Keep `reference/` read-only and excluded
  from Git, ESLint, Prettier, and TypeScript.
- `next.config.ts` disables generated agent rules to preserve `AGENTS.md`.
  The monorepo's root `pnpm-workspace.yaml` allows the native resolver build
  script used by ESLint.
- Commit the root `pnpm-lock.yaml` with dependency changes. Generated Next.js
  files, dependencies, and local environment files are ignored.
- Make meaningful, coherent commits using the Git rules in [AGENTS.md](../AGENTS.md).

## Validation

Before committing, run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and
`pnpm build`. Review the diff and stage only the intended work. Check documentation
accuracy, local links, and consistency when documentation changes.

For UI changes, compare desktop and mobile rendering with the editorial
reference and check navigation, focus states, and horizontal overflow.
