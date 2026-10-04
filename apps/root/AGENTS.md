# AGENTS.md — apps/root

App-specific instructions for `@raioviajante/root`. Repository-wide rules are in
the root `AGENTS.md`.

## Purpose and routes

This app serves raioviajante.com: the personal internet home and index of the
RaioViajante ecosystem. It is not a portfolio, résumé, developer sales page, or
SaaS landing page.

Its routes are `/`, `/projects`, and `/now`. dump, docs, and lab are separate
apps with their own domains; link to their full URLs and never implement them as
routes here.

## Implementation

- Next.js App Router, React, TypeScript, with native CSS. Keep it small;
  prefer simple solutions.
- Do not add Tailwind, MDX, Shiki, UI libraries, or testing frameworks unless a
  task explicitly needs them.
- All pages share the editorial shell, navigation, and footer. Changing content
  lives in `lib/` where practical, separate from presentation.
- Extract components only where reuse exists within this app.
- `next.config.ts` sets `agentRules: false` so Next.js does not overwrite this
  hand-written file. Keep it.

## Design

- Follow [docs/design.md](docs/design.md). Preserve the editorial design across
  the root routes and coordinate shared shell changes with the other apps.
- The previous design export was kept locally at `reference/claude-export/`.
  It is an untracked historical reference; where a local copy exists, treat it
  as read-only and never build inside it.
- Beyond the repository-wide design restraint, avoid skill bars, call-to-action
  sections, language logos, fake terminal chrome, and large animations.

## UI validation

For UI changes, besides the root validation matrix, check desktop and mobile
widths, navigation, hover and focus states, consistent containers, and the
absence of horizontal overflow.
