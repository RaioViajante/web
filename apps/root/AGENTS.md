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

- Next.js App Router, React, TypeScript, with native CSS (global styles and CSS
  modules). Keep it small; prefer simple solutions.
- Do not add Tailwind, MDX, Shiki, UI libraries, or testing frameworks unless a
  task explicitly needs them.
- All pages share the same content container, header, and footer. Page content
  lives in `lib/` (`home.ts`, `projects.ts`, `now.ts`), separate from
  presentation.
- Extract components only where reuse exists within this app.
- `next.config.ts` sets `agentRules: false` so Next.js does not overwrite this
  hand-written file. Keep it.

## Design

- Follow [docs/design.md](docs/design.md). Preserve the approved interface —
  container width, margins, typography, colors, spacing, separators, header,
  footer, and hover states — without redesigning it.
- The original design export was kept locally at `reference/claude-export/`. It
  is untracked and not part of the monorepo; where a local copy exists, treat it
  as read-only and never build inside it.
- Beyond the repository-wide design restraint, avoid skill bars, call-to-action
  sections, language logos, fake terminal chrome, and large animations.

## UI validation

For UI changes, besides the root validation matrix, check desktop and mobile
widths, navigation, hover and focus states, consistent containers, and the
absence of horizontal overflow.
