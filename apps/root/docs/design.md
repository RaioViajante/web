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
the projects pages and their sketches, the gallery board, and the font binding
for `next/font`.
Artwork is not stored in the app: the avatar frames, the gallery images and the
"work of art" sticker come from `packages/design/assets`. Gallery styles are scoped to its route; the shared shell keeps its existing geometry.

Root has routes for home, about, projects, all projects, the Stucco. client case, contact, gallery, this site, setup,
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
height, 740px column), taken from root's earlier values. Primary links comes from
`lib/links.ts`: the user's social and interest profiles, GitHub, the video-code
organization and the public email. Setup has a real route and a typed
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
Its text toggle sits alone at the top of the reading column.

### Projects

The projects area implements the approved Claude Design handoff
(`reference/raioviajante-projects.zip`, local and untracked) inside the shared
shell. Facts and English copy live in `lib/projects.ts`; Portuguese copy in
`ptProjectsCopy` (`lib/pt.ts`), typed by the same `ProjectsCopy`, including every
word drawn inside the sketches. Components are in `components/projects/`.

- **Home (00.1).** Four cards (Mochifile, Ordelis, Refrain, Orbit), each a
  single link to its card on `/projects`, with a small CSS-only sketch, icon,
  short line and status, then "More projects and client work" to `/projects`.
- **`/projects`.** "02. My projects": the same four with large sketches that
  work as local demonstrations (Mochifile: the design's Compress, Convert and
  Resize tabs with example values; Compress picks a target size, as the real
  tool does, and Convert and Resize, which Mochifile lists as coming soon,
  say "coming soon to Mochifile" in their note; Ordelis: approve or request changes in the planned review step;
  Refrain: play or stop the record; Orbit: queue and cancel executions that
  follow Orbit's transition rules, simulated in the browser). Then "View all
  projects" and "02.1 Client work": the Stucco. case and the box for the next one. There is no
  link to a client catalog; the client card component renders only real cases.
- **`/projects/all`.** All eight projects as smaller tiles, filtered by kind
  (all, tools, music, systems, languages, games) with pressed-state buttons and
  a polite count. Without JavaScript every tile stays visible. The sidebar
  keeps "projects" current (`navigationParent` in `lib/routes.ts`).
- **Honesty.** Status is a word with a solid (usable) or dashed (still being
  built) mark. Example numbers are labelled; Orbit is described as not
  scheduling or running anything yet; Ordelis and Hum sketches say they show a
  planned workflow or interface. Refrain and Morrowferry have private
  repositories and are never linked; Morrowferry says "no public link yet".
- **Artwork.** The project icons and the Mochifile wordmark are 128-pixel
  derivatives in `packages/design/assets/projects/`
  (`pnpm --filter @raioviajante/design project-icons`). Sweep and Hum have no
  logo yet, so their icon slot shows their initial on a square in their sketch
  colors (`.pj-letter`, CSS only); replace it when a logo is approved. The sketches are drawn
  in code: HTML/CSS, SVG, a seeded hand-drawn stroke generator for Refrain
  (`lib/sketch.ts`) and a token-colored pixel scene for Morrowferry. Their
  colors are the project-artwork tokens in `packages/design/styles/project-art.css`,
  loaded only by these pages; the page chrome stays
  gray, and there are no gradients, glows or shadows.
- **Delivery.** No server-rendered `style` attributes (the CSP blocks them):
  timings and positions are classes in `cards.css`, `pages.css`, `minis.css`,
  `catalog-minis.css` and `sketches.css`. Values known only in the browser
  (the Mochifile bar widths, the Orbit orbits) are set on the client through
  the CSSOM. The home page loads only the cards and the four small sketches;
  the catalog adds its own; the large sketches' CSS and client code load only
  on `/projects`.
- **Motion.** Looping animations play only while a card is hovered or has
  focus, and otherwise rest on a complete frame (WCAG 2.2.2); a playing
  Refrain record keeps spinning. Orbit queues one execution the first time
  its sketch comes into view, and after that only when the visitor asks.
  Everything stops under reduced motion.

### Client case: Stucco.

`/projects/stucco` and its Portuguese counterpart tell the case, implementing
the approved prototype (`reference/stucco-demo/`, local and untracked). The
copy is in `lib/stucco.ts` and `ptStuccoCopy` (`lib/pt.ts`), where the owner's
Portuguese is the original. Images are derived from the kit by
`pnpm --filter @raioviajante/design stucco-art <kit>` into
`packages/design/assets/projects/stucco/`, and imported from the generated
`@raioviajante/design/stucco`, so other pages never bundle them.

- **Card.** A code-drawn browser and phone repeat the demo's hero. The art is
  decorative, keeps the demo's own English in both languages, and is the one
  place Barlow appears on Root, loaded from the demo's file. It rests on photo
  01 until 45% of it is in view, pauses on hover or keyboard focus and stays
  still under reduced motion. By the approved design it runs on its own once in
  view, unlike the other cards' loops, which play only on hover or focus. Its
  only link goes to the case, as a full navigation (see
  `docs/architecture.md`).
- **Demo layer.** A native modal dialog, portaled to the body so the page
  motion's transforms cannot affect it. The frame grows from the tour or the
  button by FLIP. Esc also works from inside the demo, since it is same-origin.
- **`/work/stucco/`.** The demo is static and has no inline styles or scripts,
  so it runs under the same CSP without a nonce; `next.config.ts` sends its
  headers and `proxy.ts` skips its files. The bare path redirects to
  `index.html` because the demo's relative paths need a URL inside its folder.
- **Exceptions to the visual rules.** They apply to every client case, only
  inside its approved design. Here the frames of the tour, the card art, the
  brand art and the demo layer have shadows, the card art has a photo scrim
  that repeats the demo's, and the layer's backdrop is blurred, as the
  gallery's is.

### Gallery

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
Artwork stays in the shared design package; the sixteen Personal images live there.

Selecting a piece opens a native modal dialog with title, category, supported usage
metadata, unboxed ←/→ controls named Previous artwork / Next artwork, arrow-key navigation, Escape, and focus restoration.
Navigation wraps within its category. The dialog keeps keyboard focus inside, makes
the background inert, and locks page scrolling. Motion respects reduced-motion preferences.
Profile pictures list the networks that use them: the more personal ones (Letterboxd,
Spotify, Pinterest) use the hand-drawn picture, and `lib/links.ts` holds the split.
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
