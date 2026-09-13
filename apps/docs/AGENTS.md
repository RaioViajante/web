# AGENTS.md

Primary instruction file for coding agents working in this repository. Read this before making any changes.

## Project purpose

`docs.raioviajante.com` is the public technical documentation layer of the RaioViajante internet identity (alongside `raioviajante.com`, `dump.raioviajante.com`, and `lab.raioviajante.com`). It hosts curated, factual, technical documentation about projects and systems built under the RaioViajante identity. It is not a portfolio, blog, marketing site, or an automatic mirror of every repository's internal docs.

## Repository language

Everything in this repository is written in English: filenames, documentation, code, comments (when necessary), commit messages, metadata, and configuration descriptions. No exceptions.

## Intended stack

Astro, Starlight, TypeScript, pnpm, Markdown/MDX, Pagefind (via Starlight), deployed on Vercel. Do not introduce a different framework, package manager, or deployment target without explicit instruction.

## The `docs/` vs. `src/content/docs/` distinction

This is important and easy to get wrong:

- **`docs/`** — internal documentation about developing and maintaining *this repository*. Read by contributors and agents, not published.
- **`src/content/docs/`** — public documentation content rendered on docs.raioviajante.com. This directory does not exist yet; it will be created when Starlight is initialized.

Never conflate the two. Never place public content under `docs/`, and never place repository-maintenance documentation under `src/content/docs/`.

## Git workflow

- Every meaningful unit of work results in its own commit.
- Use Conventional Commits, in English (e.g. `docs: add project documentation foundation`, `feat: establish docs visual identity`).
- One coherent change per commit. Never mix unrelated work.
- Always inspect the diff before committing.
- Never write vague commit messages.
- Do not push unless explicitly asked to.
- Do not rewrite history (no `--amend` on existing work, no rebase) unless explicitly asked.
- Never force push.

## Working principles

- Prefer simple architecture over clever architecture.
- Keep dependencies minimal. Do not add a package unless it's clearly needed for the stack described above.
- Inspect existing code and docs before modifying anything — do not assume structure that hasn't been established yet.
- Validate work before committing (build/lint/typecheck once those tools exist; for now, read back what you wrote and check for consistency and duplication).
- Do not invent documentation content. If a fact about a project (hum, sweep, orbit, etc.) is needed and unknown, ask the user or inspect the relevant source repository — do not guess or fabricate.
- Clearly distinguish established facts from planned/future content in anything you write.
- Preserve the established RaioViajante visual identity (see `docs/design.md`) rather than defaulting to generic documentation-site aesthetics.
- Do not turn this site into a generic documentation-SaaS look-alike: avoid excessive cards, bento grids, glassmorphism, glowing gradients, decorative blobs, unnecessary animations, or marketing-style hero sections.
