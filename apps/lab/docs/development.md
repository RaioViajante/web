# Development

## Requirements

Node.js 24 or newer, pnpm (recorded in `package.json`).

## Commands

| Command             | Purpose                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| `pnpm install`      | Install dependencies from the manifest and lockfile.                   |
| `pnpm dev`          | Start the local development server.                                    |
| `pnpm build`        | Type-check (`astro check`) then build for production into `dist/`.     |
| `pnpm preview`      | Serve the production build locally.                                    |
| `pnpm check`        | Run Astro/TypeScript diagnostics (`astro check`).                      |
| `pnpm typecheck`    | Alias for `pnpm check`, used by the monorepo's `pnpm typecheck`.       |
| `pnpm test`         | Run the Node unit tests for suffixes, state transitions and the count. |
| `pnpm lint`         | Run ESLint.                                                            |
| `pnpm format`       | Apply Prettier formatting.                                             |
| `pnpm format:check` | Check formatting with Prettier without writing.                        |

## Conventions

- Astro + TypeScript, static output, shared React rendered statically, no hydration — see [`architecture.md`](architecture.md).
- Keep local design references untouched and uncommitted.
- Commits: meaningful, Conventional Commits, one coherent change per commit — see `AGENTS.md`.
- Validation: run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before committing application changes (the list in the root `AGENTS.md`).

## Manual verification

For UI changes, run `pnpm build && pnpm preview` and check in a browser:

- Routes return 200: `/`, `/experiments/filename-classifier/`, `/experiments/execution-states/`, `/experiments/boot-sector/`.
- Search, Terms, Privacy and unknown routes use the shared shell.
- Retired routes return 404 without redirects: `/experiments/parser-playground/`, `/experiments/cron-visualizer/`, `/experiments/filesystem-classifier/`.
- The dark palette on the homepage and on direct navigation to an experiment route.
- Responsive widths: 320, 375, 768, 1024, 1152, 1440.
- No horizontal page overflow, no console errors, no broken links or missing assets.

## Experiment verification

- Classifier: compare the four initial examples and `PHOTO.PNG`, `README`, `archive.tar.gz`, `.hidden`, and `notes.final.txt` with Sweep's referenced classifier and Python 3.14 `Path.suffix`. Verify long filenames wrap and input is treated as text.
- Execution states: test all five states against all four operations. Rejections preserve every field. Check nonzero success, zero-code failure, blank failure messages, queued cancellation without a start time, and a fresh example after completion. Browser integer input represents Java's signed `int`; it adds no exit-code success convention.
- Boot sector: compare displayed instructions with the referenced assembly. Verify the documented-result wording, `dw 0xAA55` explanation, and keyboard section selection, previous/next and copy. Do not generate bytes or claim fresh QEMU verification.
- Check labeled controls, table headers, live feedback, and visible keyboard focus. Exercise long input and expanded code at every responsive width.
- Verify actual document titles, favicon, internal links, and unauthenticated access to every rendered source link. A source link is published only while its repository is publicly accessible.
- Keep sibling repositories read-only while verifying provenance; do not build, install dependencies, or generate artifacts there.
