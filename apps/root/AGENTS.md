# AGENTS.md — apps/root

App-specific instructions for `@raioviajante/root`. Repository-wide rules are in
the root `AGENTS.md`.

## Purpose and routes

This app serves raioviajante.com: the personal internet home and index of the
RaioViajante ecosystem. It is not a portfolio, résumé, developer sales page, or
SaaS landing page, but it does show the owner's work: personal projects and, as
written-up cases, client work.

Its routes are `/`, `/about`, `/projects`, `/projects/all`, `/projects/stucco`,
`/contact`, `/gallery`, `/this-site`, `/setup`, `/search`, `/privacy`, and
`/terms`, plus a partial Portuguese tree (`/pt`, `/pt/about`, `/pt/projects`,
`/pt/projects/all`, `/pt/projects/stucco`, `/pt/contact`, `/pt/gallery`,
`/pt/this-site`, `/pt/setup`, `/pt/terms`, `/pt/privacy`, `/pt/search`,
`/pt/search-index.json`) declared in `lib/routes.ts`, and the static demo
`/work/stucco/` served from `public/` (noindex, outside the sitemap and search);
see `docs/architecture.md`. dump, docs, and lab are separate
apps with their own domains; link to their full URLs and never implement them as
routes here.

## Implementation

- Next.js App Router, React, TypeScript, with native CSS. Keep it small;
  prefer simple solutions.
- Do not add Tailwind, MDX, Shiki, UI libraries, or testing frameworks unless a
  task explicitly needs them.
- All pages share the shell, navigation, and footer from `@raioviajante/design`. Changing content
  lives in `lib/` where practical, separate from presentation.
- Extract components only where reuse exists within this app.
- `next.config.ts` sets `agentRules: false` so Next.js does not overwrite this
  hand-written file. Keep it.

## Design

- Follow [docs/design.md](docs/design.md). Preserve the shared design across
  the root routes and coordinate shared shell changes with the other apps.
- The previous design export was kept locally at `reference/claude-export/`.
  It is an untracked historical reference; where a local copy exists, treat it
  as read-only and never build inside it.
- Beyond the repository-wide design restraint, avoid skill bars, call-to-action
  sections, language logos, fake terminal chrome, and large animations. Client
  cases may frame their screenshots in browser and phone chrome and animate
  their demo layer (see the repository-wide client-case exceptions). The
  gallery is the other owner-approved exception: its stickers burst out of the
  cover and gather back into it, and its Personal artwork pops in on scroll,
  each with its own voice and nothing under reduced motion
  ([docs/design.md](docs/design.md)). Do not extend these to other pages.

## UI validation

For UI changes, besides the root validation matrix, check desktop and mobile
widths, navigation, hover and focus states, consistent containers, and the
absence of horizontal overflow.
