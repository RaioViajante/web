# Design

The root site is the first implementation of the editorial RaioViajante design.
Its visual reference is bero.land: a charcoal canvas, restrained monospaced
typography, numbered navigation and sections, dotted leader rows, generous
whitespace, and a small centered footer. The character illustration and content
are original to RaioViajante.

Root uses the shared design system in `@raioviajante/design`. `app/layout.tsx`
imports `@raioviajante/design/styles.css` and renders the shared `<Behavior />`
script once. Each page renders `components/RootShell.tsx`, which configures the
shared `Shell` (sidebar, sound toggle, 740px column, footer) with root's pages
and the search menu item. Page parts (`IndexHeader`, `PageHeader`, `Section`,
`LeaderRow`), the `Quote` block, `LegalPage` and `NotFoundPage` also come from
the package. Navigation between pages is by full page load.

Root keeps only what is its own, in `app/globals.css` and `components/`: the
avatar flip (`AvatarCoin`), the hover descriptions on home rows (`PreviewRow`),
the projects list, the gallery board, and the font binding for `next/font`.
Artwork is not stored in the app: the avatar frames, the gallery images and the
"work of art" sticker come from `packages/design/assets`. The gallery geometry
is written in rem against a 110% root size, which `globals.css` keeps.

Root has routes for home, about, projects, contact, gallery, this site, setup,
search, privacy, and terms of use, and a 404 page (`app/not-found.tsx`) built on
the shared template. The primary navigation contains the local content
routes except Setup,
which is linked from the home page. The footer links to the four independently
deployed sites. The home page shows recent dump posts from its public RSS feed;
the feed is eligible for revalidation after 60 seconds. A known-post fallback
keeps the section populated if the feed is unavailable. The footer contains the
supplied public email. Its CNPJ
line shows the CNPJ supplied by the user. The footer links to the root site's
privacy policy and terms of use.

Typography is the shared token scale (Noto Sans Mono, 16.5px body, 1.82 line
height, 740px column), taken from root's earlier values. Primary links currently
contains the user's GitHub and public email. Setup has a real route and a typed
gear list based on the user's supplied model names; no product links have been
provided yet.
The home page links to Setup under "Other links" after "Latest writing".
Linked rows are clickable across their full width. Primary links and project
rows on the home page reveal their descriptions after 400 ms of pointer hover,
or immediately on keyboard focus. The avatar flips on click
with a separate two-part flip sound.
Its ten-frame illustration loops every three seconds after the frames have
loaded. Reduced motion keeps the centered portrait still and disables the flip.
Sound is off until enabled by the visitor; the shared preference is the
`rv-sound` cookie on `.raioviajante.com`.
Its text toggle sits alone at the top of the reading column. The Projects page
uses an editorial list with name, status, description, type, and destination for
each entry.
The gallery opens with the user's "Work of Art" illustration. It floats subtly
on hover or keyboard focus; clicking or tapping it reveals two overlapping groups
of artwork, including the character sticker sheet and hospital scene, with a short paper-like sound when
SOUND is enabled. Each artwork rises gently on hover or keyboard focus and opens
the full image when selected. Reduced motion keeps the click-to-reveal interaction
without the movement. The homepage avatar and favicon also come from the user's
art collection. The supplied favicon PNG is
the source for the multi-size `app/favicon.ico`, `app/icon.png`,
`app/apple-icon.png`, and the 192-pixel icon referenced by `app/manifest.ts`.
The About page uses Bryan's supplied personal introduction and interests without
turning into a résumé. Contact keeps email as the primary channel and gives a
short guide to first messages. This Site describes the root app and links to the
public source repository.

The earlier Claude export in the local `reference/` directory remains an
untracked historical reference. It is not the source of truth for this redesign.
