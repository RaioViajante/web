# AGENTS.md — apps/lab

App-specific instructions for `@raioviajante/lab`. Repository-wide rules are in
root `AGENTS.md`.

## Purpose

lab.raioviajante.com hosts experiments and technical curiosities. The shell
stays consistent; each experiment owns its interactive surface.

## Stack and rendering

- Astro and TypeScript, static output. Shared React components render through
  `@astrojs/react` without hydration. Never add `client:*` or browser React.
- `BaseLayout.astro` loads self-hosted Noto Sans Mono, shared `styles.css` and
  `startBehavior()`. `LabFrame.tsx` configures the shared `Shell`, search item,
  experiment navigation and footer. Apps never import another app.
- Interactive benches use small plain TypeScript scripts in Astro `<script>`
  tags. Pure logic lives in `src/lib`; source excerpts live in `src/data`.
- Keep page JavaScript minimal. Shared behavior handles sound, search, avatar,
  copy buttons and other shared interactions.

## Content and provenance

- `src/data/experiments.ts` owns permanent IDs, dates, status, project, revision,
  fidelity and public source links. Preserve 001–003 and descending index order.
- Follow [docs/content.md](docs/content.md). Check pinned real source before
  changing behavior; sibling repositories are read-only evidence.
- Filename suffixes reproduce Python 3.14 POSIX `Path.suffix`, lowercased for
  Sweep matching. Preserve spaces. A trailing dot is suffix `.`.
- Execution rules reproduce Orbit `cd97666`, including Java blank-message
  semantics and integer exit codes. Rejected actions preserve all state fields.
- Boot source and notes come from x86-os-experiment `e966889`. Do not substitute
  reconstructed assembly, generate bytes, or imply browser emulation.
- No unknown fact or placeholder may render publicly. Omit it and record it in
  the migration report. Omit private source links.

## Design and interactivity

- See [docs/design.md](docs/design.md). Use shared page parts, soft blocks,
  benches, controls, legal and 404 templates. Anything reused across pages
  belongs in `packages/design`; `lab.css` contains lab-specific pieces only.
- No local shell, colors, font system, sound synthesis or artwork copies.
- Bench output may use shared syntax tokens; the surrounding page is gray.
- Accepted actions call `playSound("success")`, rejected actions call
  `playSound("reject")`. No sound on load. Words, solid/dotted buttons and live
  feedback must convey the outcome without sound or color.
- Dotted controls remain keyboard reachable and clickable to demonstrate a
  rejection. New examples reset browser state; no commands run or data persists.

## Validation

Run lab `format:check`, `lint`, `typecheck`, `test` and `build`, using named pnpm
filters from the repository root. Tests use Node 24's built-in runner and native
TypeScript support. For UI changes, check every lab page at 1440px and 390px,
including experiments with mouse and keyboard; see [docs/development.md](docs/development.md).
