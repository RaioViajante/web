# AGENTS.md — apps/docs

App-specific instructions for `@raioviajante/docs`. Repository-wide rules are in
the root `AGENTS.md`.

## Purpose

This app serves docs.raioviajante.com: curated, factual technical documentation
about projects and systems built under RaioViajante. It is not a portfolio,
blog, marketing site, or an automatic mirror of other projects' internal docs.

## Stack

Astro, with shared React components from `@raioviajante/design` rendered
statically (`@astrojs/react`, no hydration) and a plain Astro content
collection. Starlight was removed in Phase 4c: the design needs a two-column
shell it does not provide. Search is the shared client-side search over
`/search-index.json`. Do not introduce another framework or documentation
system without explicit instruction.

## Three kinds of documentation

Keep these separate:

- **Repository-level `docs/`** (at the repository root) — monorepo-wide
  documentation.
- **`apps/docs/docs/`** — internal documentation about developing this app. Not
  published.
- **`apps/docs/src/content/docs/`** — the public pages rendered on
  docs.raioviajante.com.

Never put public content in either `docs/` directory, and never put maintenance
notes in `src/content/docs/`. Content organization is described in
[docs/content.md](docs/content.md).

## Content accuracy

Do not invent facts about documented projects (sweep, hum, orbit, and others).
If a needed fact is unknown, ask the user or inspect the project's source
repository. Publish project behavior only once it is implemented and stable.

## Design

- Follow [docs/design.md](docs/design.md). Every page is built on the shared
  shell (`src/layouts/DocsShell.astro`); styles, components, artwork and sound
  come from `@raioviajante/design`, and `src/styles/docs.css` holds only what
  is docs' own.
- A documentation page is a Markdown file in `src/content/docs/` with the
  frontmatter in `src/content.config.ts`. Callouts use `:::note`, `:::important`
  and `:::warning`; code fences use the soft-block options in
  [`docs/blocks.md`](../../docs/blocks.md).
- Keep the fixed dark palette and omit theme controls.
- No placeholder may render on a public page. Leave a fact out until it is
  known.

## Formatting and validation

This app has no formatter, linter, or tests configured. Match the existing
style, including tab indentation in Astro and config files. Validate with
`typecheck` (`astro check`) and `build`.
