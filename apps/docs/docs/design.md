# Design

## Shared RaioViajante visual identity

docs.raioviajante.com is part of the RaioViajante ecosystem and should clearly belong to the same visual identity as the rest of it:

- **Background:** `#18161b`
- **Foreground:** `#ece7e0`
- **Accent:** `#c3b3e0`
- **IBM Plex Mono** for system-like UI, paths, labels, metadata, and code-adjacent elements
- **Source Serif 4** for prose / editorial voice
- Restrained use of purple (the accent is a highlight, not a theme)
- Generous whitespace
- Typography-driven hierarchy (structure communicated through type, not decoration)
- GitHub icon-only treatment (no text-labeled social buttons)
- Understated interactions (subtle, not showy)

## Adapting the identity for documentation

docs.raioviajante.com does not need to copy the ~680px centered layout used on raioviajante.com. Documentation has functional needs raioviajante.com doesn't:

- a navigation sidebar
- code blocks
- tables
- multi-level headings
- search
- a table of contents

The layout should give these elements the space they need while keeping the same colors, typography, and restrained tone as the rest of the identity. Adapting the identity to this use case is expected; abandoning it is not.

## Explicitly avoid

- Generic documentation-SaaS aesthetics
- Excessive cards
- Bento grids
- Glassmorphism
- Glowing gradients
- Decorative blobs
- Unnecessary animations
- Giant marketing hero sections

## Status

The approved visual system is implemented in the Astro/Starlight application. The current site includes the shared colors and typography, custom header and footer treatment, theme toggle, flat sidebar, canonical 680px reading column, and responsive article rails described above.
