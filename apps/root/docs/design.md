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

Root has four routes: `/`, `/setup`, `/projects`, and `/now`. The primary navigation
contains these local routes only. The footer links to the four independently
deployed sites. The home page shows recent dump posts from its public RSS feed;
the feed is revalidated every 15 minutes, with a known-post fallback if the
feed is unavailable. The footer contains the supplied public email. Its CNPJ
line awaits the exact registration number from the user.

The typography now follows Bero's Noto Sans Mono scale: 110% root size, 0.9375rem
body text, 1.82 line height, and a 42rem reading column. Primary links currently
contains the user's GitHub and public email. Setup has a real route and a typed
gear list based on the user's supplied model names; no product links have been
provided yet.

The earlier Claude export in the local `reference/` directory remains an
untracked historical reference. It is not the source of truth for this redesign.
