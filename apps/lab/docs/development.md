# Development

## Requirements

Node.js 24 or newer, pnpm (recorded in `package.json`).

## Commands

| Command             | Purpose                                                            |
| ------------------- | ------------------------------------------------------------------ |
| `pnpm install`      | Install dependencies from the manifest and lockfile.               |
| `pnpm dev`          | Start the local development server.                                |
| `pnpm build`        | Type-check (`astro check`) then build for production into `dist/`. |
| `pnpm preview`      | Serve the production build locally.                                |
| `pnpm check`        | Run Astro/TypeScript diagnostics (`astro check`).                  |
| `pnpm typecheck`    | Alias for `pnpm check`, kept for cross-repo consistency.           |
| `pnpm lint`         | Run ESLint.                                                        |
| `pnpm format`       | Apply Prettier formatting.                                         |
| `pnpm format:check` | Check formatting with Prettier without writing.                    |

## Conventions

- Astro + TypeScript, static output, no UI framework — see [`architecture.md`](architecture.md).
- Keep `reference/claude-export/` untouched; it is git-ignored.
- Commits: meaningful, Conventional Commits, one coherent change per commit — see `AGENTS.md`.
- Validation: run `pnpm format`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` before committing application changes.

## Manual verification

For UI changes, run `pnpm build && pnpm preview` and check in a browser:

- Routes: `/`, `/experiments/parser-playground/`, `/experiments/boot-sector/`.
- Both themes, persistence across reload, and direct navigation to an experiment route in each theme.
- Responsive widths: 320, 375, 768, 1024, 1152, 1440.
- No horizontal page overflow, no console errors, no broken links or missing assets.
