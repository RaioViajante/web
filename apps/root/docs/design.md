# Design

## Source of truth

`/refence/claude-export/` is the approved visual source of truth named in the
project brief. Its actual location in this checkout is
[`../reference/claude-export/`](../reference/claude-export/). Keep it read-only:
do not modify, move, rename, delete, or build the application inside it.

Use the approved Home, Projects, Now, Nav, and Footer exports. Their page styles
establish the design; the bundled generic Broadsheet theme does not replace them.
Implement the reference rather than reinterpreting it.

## Visual principles

- A personal internet home, not a portfolio.
- An editorial / Unix-inspired aesthetic with typography-driven hierarchy.
- Dark background (`#18161b`), warm foreground (`#ece7e0`), and restrained purple
  accent (`#c3b3e0`).
- Source Serif 4 and IBM Plex Mono, following the reference's sizes and line heights.
- Generous whitespace and a consistent horizontal content container across pages,
  header, and footer. Preserve the exported 680px maximum and fluid gutter styling,
  checking its box model and responsive behavior during implementation.
- GitHub icon-only header treatment linking to https://github.com/RaioViajante,
  with an accessible name.
- External domains shown as external destinations; internal routes presented as
  part of raioviajante.com.
- Preserve spacing, separators, hover states, and responsive padding accurately.

## Prohibited additions

Do not add glassmorphism, bento grids, glowing gradients, decorative blobs, fake
terminal chrome, skill bars, huge animations, generic SaaS UI, generic developer
portfolio sections, or unnecessary cards. Do not add background grids, language
logos, CTA sections, or other decoration absent from the reference.

Whitespace is intentional; do not fill empty areas merely because they are empty.
