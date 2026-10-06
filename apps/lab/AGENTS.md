# AGENTS.md — apps/lab

App-specific instructions for `@raioviajante/lab`. Repository-wide rules are in
the root `AGENTS.md`.

## Purpose

This app serves lab.raioviajante.com: experiments, prototypes, and technical
curiosities that have not decided what they are yet. It is not a portfolio,
blog, or stable documentation.

Core rule: **the shell is consistent, the experiments are allowed to
misbehave.** The global shell (header, footer, canonical content
width) stays disciplined and unmistakably RaioViajante. An experiment may
introduce a specialized interactive surface inside its own content area, but it
must not redesign or destabilize the shell.

## Stack

Astro and TypeScript, static-first. No client-side React: shared React components
render statically, with no hydration. Keep experiment interactivity in small
browser scripts unless the experiment needs a more capable client framework.

## Experiments

- Experiment data is centralized in `src/data/experiments.ts`, not hardcoded in
  page markup. Do not add a database or CMS.
- Experiment pages default to the canonical 680px column. Opt into the `wide`
  layout only when an experiment genuinely needs more horizontal space.
- Keep each experiment's code isolated to its own surface component and helpers.
- Experiments are real, provenance-backed content. Follow
  [docs/content.md](docs/content.md) for immutable numbering, publication dates,
  and public source links. Never present planned project functionality as
  implemented, and do not invent fictional technical content.

## Design

- Follow [docs/design.md](docs/design.md) for the shared shell: the 680px column
  with a `clamp(1rem, 4vw, 1.25rem)` gutter, the color tokens, and the rule that
  mono identifies and serif speaks.
- Keep the fixed dark palette and omit theme controls.
- The original design export was kept locally at `reference/claude-export/`. It
  is untracked and not part of the monorepo; where a local copy exists, treat it
  as read-only and never format, build in, or commit it. Implement the intended
  design, not bugs from the design environment listed in `docs/design.md`.
- No dashboards, fake browser or terminal chrome, or unnecessary animation.

## UI validation

For UI changes, also follow the manual verification checklist in
[docs/development.md](docs/development.md).
