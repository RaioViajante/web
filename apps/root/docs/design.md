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
the package. Internal links use `next/link` for client-side navigation, without
prefetching. `lib/seo.ts` lists every page's title and description; it feeds
page metadata, the social cards under `/og/`, `sitemap.xml` and `robots.txt`.

Root keeps only what is its own, in `app/globals.css` and `components/`: the
avatar flip (`AvatarCoin`), the hover descriptions on home rows (`PreviewRow`),
the projects list, the gallery board, and the font binding for `next/font`.
Artwork is not stored in the app: the avatar frames, the gallery images and the
"work of art" sticker come from `packages/design/assets`. Gallery styles are scoped to its route; the shared shell keeps its existing geometry.

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
The gallery opens from an isolated, gently floating Work of Art cover, with a
small muted hint below the sticker. Activating its keyboard-accessible button
reveals or hides Branding, Profiles, and Personal, with a short unfolding motion
and staggered sticker release. Focus
stays on the cover, which scrolls into view as the collection enters normal document
flow. Reduced motion
stops the float and reveals immediately; without JavaScript the server-rendered
collection remains visible. The local export starts open and has no opening
choreography; this entry interaction refines it without changing the final layout.
Gallery artwork uses the shared `data-sound="gallery"` hover/click voice, including
the cover, with no additional manual sound dispatch. Thirty
stickers share one transparent atlas (a 1080px AVIF preview, with the 2160px WebP
original reserved for the viewer and downloads); the avatar uses the existing shared animation
and shows its ten frames. Personal artwork forms a responsive overlapping collage.
The artwork model lives in `lib/gallery.ts`, the client interaction in
`components/GalleryBoard.tsx`, and the route styles in `app/gallery/gallery.css`.
Artwork stays in the shared design package; the existing nine Personal images are reused.

Selecting a piece opens a native modal dialog with title, category, supported usage
metadata, unboxed ←/→ controls named Previous artwork / Next artwork, arrow-key navigation, Escape, and focus restoration.
Navigation wraps within its category. The dialog keeps keyboard focus inside, makes
the background inert, and locks page scrolling. Motion respects reduced-motion preferences.
Individual profile downloads use the supplied 1254px PNG originals; Personal downloads
use the existing full-size WebPs. Stickers are viewed individually and downloaded as
a sheet, matching the reference. Collection downloads select Branding (sticker and
avatar sheets), Profiles, and/or Personal, and package only those files in a ZIP.
Regenerate the display atlas with
`pnpm --filter @raioviajante/design exec node scripts/gallery-art.mjs`.
The dependency-free ZIP helper loads on demand; a failed fetch cancels the archive
instead of silently saving an incomplete collection. No game artwork is included.

The homepage avatar and favicon also come from the user's
art collection. The supplied favicon PNG is
the source for the multi-size `app/favicon.ico`, `app/icon.png`,
`app/apple-icon.png`, and the 192-pixel icon referenced by `app/manifest.ts`.
The About page uses Bryan's supplied personal introduction and interests without
turning into a résumé. Contact keeps email as the primary channel and gives a
short guide to first messages. This Site describes the root app and links to the
public source repository.

The supplied Gallery export in the local `reference/` directory is the visual and
interaction specification for this redesign. It is locally excluded from Git; its
runtime and prototype source are not production dependencies.
