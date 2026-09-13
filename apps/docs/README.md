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
- **Public documentation** (`src/content/docs/`) — the actual content rendered on docs.raioviajante.com.

See [`docs/architecture.md`](docs/architecture.md) and [`AGENTS.md`](AGENTS.md) for more detail on this distinction.

## Intended stack

- Astro
- Starlight
- TypeScript
- pnpm
- Markdown / MDX
- Pagefind (via Starlight)
- Vercel

## Current and future content areas

The current public documentation contains:

- `projects/`
  - `sweep`
- `raioviajante/`
  - design language
  - repository conventions

Other projects may receive documentation only when their implemented behavior is stable and useful enough to publish. Project specifications and future plans are not published as current behavior.

## Development

```
pnpm install   # install dependencies
pnpm dev       # start the local development server
pnpm build     # production build (also builds the Pagefind search index)
pnpm preview   # serve the production build locally
pnpm check     # run Astro/TypeScript diagnostics
```

See [`docs/development.md`](docs/development.md) for more detail.

## Current status

The Astro/Starlight application is initialized and includes the approved RaioViajante visual system, a bespoke homepage, article navigation, table-of-contents support, heading permalinks, and dark/light themes. Published content includes the Sweep project page and the two RaioViajante pages under `src/content/docs/`.
