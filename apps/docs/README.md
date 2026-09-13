# docs.raioviajante.com

Public technical documentation site for projects and systems built under the RaioViajante identity.

## Role in the RaioViajante identity

RaioViajante's internet presence is split across a few properties, each with a distinct purpose:

- `raioviajante.com` — root / personal internet home
- `dump.raioviajante.com` — writing
- `docs.raioviajante.com` — public technical documentation (this repository)
- `lab.raioviajante.com` — experiments

This site is the public technical documentation layer. It is not a portfolio, not a blog, not a marketing site, and not a mirror of every repository's internal `docs/` directory.

## What this is not

- Not a portfolio site.
- Not a blog.
- Not a marketing site.
- Not an automatic mirror of internal documentation from other repositories.

Only documentation that is genuinely worth organizing and making navigable for the public belongs here.

## Repository documentation vs. public documentation

These are two different concepts:

- **Repository documentation** (`docs/` in this repo) — internal documentation about developing and maintaining this repository itself.
- **Public documentation** (`src/content/docs/`, once Starlight is initialized) — the actual content rendered on docs.raioviajante.com.

See [`docs/architecture.md`](docs/architecture.md) and [`AGENTS.md`](AGENTS.md) for more detail on this distinction.

## Intended stack

- Astro
- Starlight
- TypeScript
- pnpm
- Markdown / MDX
- Pagefind (via Starlight)
- Vercel

## Initial content areas

Public documentation is expected to eventually cover, at minimum:

- `projects/`
  - `hum`
  - `sweep`
  - `orbit`
- `raioviajante/`
  - design language
  - repository conventions

These are planned areas, not existing pages. Content will be added as it becomes real and worth publishing.

## Current status

This repository currently contains only its documentation foundation (this README, `AGENTS.md`, `CLAUDE.md`, and `docs/`). The Astro/Starlight application has not been initialized yet, and no dependencies have been installed.
