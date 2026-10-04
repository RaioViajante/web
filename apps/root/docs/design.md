# Design

The root site is the first implementation of the editorial RaioViajante design.
Its visual reference is bero.land: a charcoal canvas, restrained monospaced
typography, numbered navigation and sections, dotted leader rows, generous
whitespace, and a small centered footer. The character illustration and content
are original to RaioViajante.

The shared shell rules live in `@raioviajante/design/editorial.css`. Root imports
them in `app/layout.tsx`, then defines page-specific styling in
`app/globals.css`. The shell covers the top line, navigation, page grid, hero,
section headings, leader rows, footer, focus states, and responsive behavior.
Other apps will consume the shell as they are migrated. Each app keeps its own
routes and content.

Root has three routes: `/`, `/projects`, and `/now`. The primary navigation
contains these local routes only. The footer links to the four independently
deployed sites. The home page shows recent dump posts from its public RSS feed;
the feed is revalidated every 15 minutes, with a known-post fallback if the
feed is unavailable. The footer does not yet contain business details because
the public CNPJ and contact text have not been supplied.

The earlier Claude export in the local `reference/` directory remains an
untracked historical reference. It is not the source of truth for this redesign.
