# Design

## Source of truth

`/refence/claude-export/` is the approved visual source of truth named in the
project brief. It was kept locally at `reference/claude-export/`, untracked,
and is not part of the monorepo checkout. Where available, keep it read-only:
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

## Color tokens

root consumes `@raioviajante/design` (`"@raioviajante/design": "workspace:*"`).
`app/layout.tsx` imports `@raioviajante/design/tokens.css` before
`app/globals.css`, and `globals.css` keeps root's own variable names as aliases
of the shared primitives:

- `--background` → `--rv-color-bg`
- `--foreground` → `--rv-color-fg`
- `--accent` → `--rv-color-accent`
- `--muted` → `--rv-color-muted`
- `--separator` → `--rv-color-hairline`

Pages and components use the root names, never `--rv-color-*` directly. Values
specific to root stay in `globals.css`: `--subtle`, `color-scheme`, the content
width and gutter, and the theme toggle's sun color and shadows. The selection
and focus rules and the theme bootstrap also stay in root. The switch to shared
tokens was made without any rendered change.

## Prohibited additions

Do not add glassmorphism, bento grids, glowing gradients, decorative blobs, fake
terminal chrome, skill bars, huge animations, generic SaaS UI, generic developer
portfolio sections, or unnecessary cards. Do not add background grids, language
logos, CTA sections, or other decoration absent from the reference.

Whitespace is intentional; do not fill empty areas merely because they are empty.
