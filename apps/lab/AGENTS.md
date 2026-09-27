# AGENTS.md

Primary instruction file for coding agents working in this repository. Read this before making any changes.

## Project purpose

`lab.raioviajante.com` is the experimental part of the RaioViajante internet identity, alongside `raioviajante.com` (identity / personal index), `dump.raioviajante.com` (writing and thoughts), and `docs.raioviajante.com` (stable public technical documentation). It hosts experiments, prototypes, and technical curiosities that haven't decided what they are yet. It is not a portfolio, blog, or stable documentation.

Core rule: **the shell is consistent, the experiments are allowed to misbehave.** The global shell (header, footer, theme, canonical content width) stays disciplined and unmistakably RaioViajante. An individual experiment surface may introduce specialized interaction, but experiments do not get permission to redesign the site around themselves.

## Repository language

Everything in this repository is written in English: filenames, documentation, code, comments (when necessary), commit messages, metadata, and configuration descriptions. No exceptions.

## Stack

Astro, TypeScript, pnpm. Static-first architecture — no React, Vue, Svelte, or another UI framework unless a specific future experiment genuinely requires client-side interactivity beyond what a small inline script can provide. Do not add dependencies that aren't clearly needed.

## Visual identity

Preserve the shared RaioViajante identity described in [`docs/design.md`](docs/design.md):

- Canonical content width: 680px, with a `clamp(1rem, 4vw, 1.25rem)` responsive gutter.
- Dark theme: background `#18161b`, foreground `#ece7e0`, accent `#c3b3e0`.
- Typography: IBM Plex Mono for identity, navigation, paths, labels, metadata, and code-adjacent UI; Source Serif 4 for prose and editorial voice. **Mono identifies. Serif speaks.**
- The same theme selector (fixed bottom-left, small, circular, understated) used across the ecosystem, ported from the real sibling implementations, not reinvented.

Do not redesign the approved Claude Design direction. If the exported prototype contains implementation bugs from the design environment (e.g. experiment surfaces growing to viewport width), reproduce the intended design, not the bug — see `docs/design.md` for the specific list.

## Reference material

The approved Claude Design export lives at [`reference/claude-export/`](reference/claude-export/). Treat it as **read-only**: never modify, move, rename, delete, format, or build inside it, and never commit it — it is excluded via `.gitignore`. Inspect it for visual truth; implement cleanly in the real application instead of copying its markup.

## Experiment content model

Experiment data is centralized (`src/data/experiments.ts` or equivalent) rather than hardcoded into page markup, so adding, removing, or reordering experiments is trivial. Do not build a database or a CMS.

Experiment pages default to the canonical 680px column. An experiment may opt into a wider `wide` layout only when it genuinely needs more horizontal space; `canonical` is the default and `experiment` must never be treated as a synonym for full-width.

## Git workflow

- Every meaningful unit of work results in its own commit.
- Use Conventional Commits, in English (e.g. `feat: implement lab experiment index`).
- One coherent change per commit. Never mix unrelated work.
- Always inspect `git status` and `git diff` before staging and committing.
- Never write vague commit messages.
- Do not push unless explicitly asked to.
- Do not rewrite history (no `--amend` on existing work, no rebase) unless explicitly asked.
- Never force push.

## Working principles

- Prefer simple architecture over clever architecture. No premature abstractions, no speculative flexibility.
- Keep dependencies minimal.
- Inspect existing code and docs before modifying anything.
- Validate work before committing: run the project's format, lint, typecheck, and build scripts (see `docs/development.md`).
- Do not invent substantial fictional technical content for the demonstration experiments — they exist to establish the reusable page system, not to document real projects.
- Do not turn this site into a generic dashboard or documentation-SaaS look-alike: no cards, no bento grids, no glassmorphism, no glowing gradients, no decorative blobs, no fake browser/terminal chrome, no unnecessary animation.
