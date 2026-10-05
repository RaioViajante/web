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

Root has routes for home, about, projects, contact, gallery, setup, privacy,
and terms of use. The primary navigation contains the local content routes except Setup,
which is linked from the home page. The footer links to the four independently
deployed sites. The home page shows recent dump posts from its public RSS feed;
the feed is eligible for revalidation after 60 seconds. A known-post fallback
keeps the section populated if the feed is unavailable. The footer contains the
supplied public email. Its CNPJ
line shows the CNPJ supplied by the user. The footer links to the root site's
privacy policy and terms of use.

The typography now follows Bero's Noto Sans Mono scale: 110% root size, 0.9375rem
body text, 1.82 line height, and a 42rem reading column. Primary links currently
contains the user's GitHub and public email. Setup has a real route and a typed
gear list based on the user's supplied model names; no product links have been
provided yet.
The home page links to Setup under "Other links" after "Latest writing".
Sidebar links only brighten on hover. In content rows, the left label brightens
without changing size, while the right note brightens and scales by 1.8%.
Linked rows are clickable across their full width, with a pointer cursor. Either
side activates the same row response and optional short menu hover sound.
Linked rows give a subtle inset press response and a distinct click sound when sound
is enabled. Primary links and project rows reveal their descriptions after 400 ms
of pointer hover, or immediately on keyboard focus. The avatar flips on click
with a separate two-part flip sound.
Sound is off until enabled by the visitor and its preference is stored in the browser.
Its text toggle sits alone at the top of the reading column. The Projects page
uses an editorial list with name, status, description, type, and destination for
each entry.
The gallery opens with the user's "Work of Art" illustration. It floats subtly
on hover or keyboard focus; clicking or tapping it reveals two overlapping groups
of artwork with a short paper-like sound when SOUND is enabled. Each artwork rises
gently on hover or keyboard focus and opens the full image when selected. Reduced
motion keeps the click-to-reveal interaction without the movement. The homepage
portrait and favicon also come from the user's art collection. Gallery and portrait
assets live under `public/art/` as lossless WebP files; the supplied favicon lives
in `app/favicon.ico`. The About page contains only verified project context until
the user provides biographical details.

The earlier Claude export in the local `reference/` directory remains an
untracked historical reference. It is not the source of truth for this redesign.
