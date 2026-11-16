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

Root has routes for home, about, projects, all projects, the Stucco. and Quadra cases, contact, gallery, this site, setup,
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
gear list (`lib/setup.ts`) based on the user's supplied model names. An item
with an owner-supplied affiliate link shows it with `rel="sponsored"` below the
affiliate disclosure; the others say no trusted link is available.
The home page links to Setup under "Other links" after "Latest writing".
Linked rows are clickable across their full width. Primary links and project
rows on the home page reveal their descriptions after 400 ms of pointer hover,
or immediately on keyboard focus. On every page, in both languages, a link
that leaves the four sites (profiles, Setup's affiliate links, project
actions, GitHub, the ANPD guide) opens in a new tab and says so to assistive
technology; the email and every RaioViajante destination stay in the tab.
The one exception is a case's demo layer, whose "New tab" button opens
its static demo (`/work/stucco/`, `/work/quadra/`) in a new tab by design, and says so. The avatar flips on click
with a separate two-part flip sound.
Its ten-frame illustration loops every three seconds after the frames have
loaded. Reduced motion keeps the centered portrait still and disables the flip.
Sound is off until enabled by the visitor; the shared preference is the
`rv-sound` cookie on `.raioviajante.com`.
Its text toggle sits alone at the top of the reading column.

### Projects

The projects area implements the approved Claude Design handoffs
(`reference/raioviajante-projects.zip` and its successor in `reference/new/`,
both local and untracked) inside the shared shell, with the project facts
verified for the first one kept where the second differs. Facts and English copy live in `lib/projects.ts`; Portuguese copy in
`ptProjectsCopy` (`lib/pt.ts`), typed by the same `ProjectsCopy`, including every
word drawn inside the sketches. Components are in `components/projects/`.

- **Cards.** Home (00.1) and `/projects` share one compact card: the
  project's small sketch in a 16:10 frame with its status over the art, top
  right, on the page's gray; then icon, name, kind, the short description
  and where to see it (the docs, the lab experiment, the essay, the site or
  the repository; "no public link yet" for Morrowferry). The cards stand in
  two columns, the second a step lower; one column on phones.
- **Home (00.1).** The four featured projects (Mochifile, Ordelis, Refrain,
  Orbit), then "All projects, including client work" to `/projects`.
- **`/projects`.** "02. My projects": the same four, and a "Show 4 more
  projects" button (`aria-expanded`) that shows yanawa, Sweep, Hum and
  Morrowferry in place and becomes "Show fewer projects". Without
  JavaScript they stay hidden and "View all projects" lists every one. The
  earlier interactive sketches (Mochifile's tabs, Ordelis's approval, the
  Orbit simulation, the Refrain record) were retired with this design.
  Then "02.1 Cases": Stucco. (client work) and Quadra (an academic
  project), each card a browser and a phone showing its demo.
- **`/projects/all`.** All eight projects as smaller tiles in the same two
  stepped columns, filtered by kind (all, tools, music, systems, languages,
  games) with pressed-state buttons and a polite count; the step follows the
  tiles that are shown. Without JavaScript every tile stays visible. The sidebar
  keeps "projects" current (`navigationParent` in `lib/routes.ts`).
- **Honesty.** Status is a word with a solid (usable) or dashed (still being
  built) mark. Example numbers are labelled; Orbit is described as not
  scheduling or running anything yet; Ordelis and Hum sketches say they show a
  planned workflow or interface. Refrain and Morrowferry have private
  repositories and are never linked; Morrowferry says "no public link yet".
- **Artwork.** The project icons are 128-pixel derivatives in
  `packages/design/assets/projects/`
  (`pnpm --filter @raioviajante/design project-icons`); Refrain's is the
  app's own touch icon. Sweep and Hum have no
  logo yet, so their icon slot shows their initial on a square in their sketch
  colors (`.pj-letter`, CSS only); replace it when a logo is approved. The sketches are drawn
  in code: HTML/CSS, SVG and a token-colored pixel scene for Morrowferry.
  Their colors are the project-artwork tokens in
  `packages/design/styles/project-art.css`, loaded only by these pages; the
  page chrome stays gray, and there are no gradients, glows or shadows,
  except in Refrain's.
- **Refrain's art.** By the approved design (v3), Refrain's card dresses as
  the app: paper, a wine "refrain" wordmark in Archivo, a line in
  Instrument Serif italic, a note in La Belle Aurore, a Silkscreen kicker, a
  sleeve titled "Grace." with its photo and a record half out of it, a navy
  band under a torn edge (`components/projects/RefrainArt.tsx`). The catalog
  shows a compact version. Like a case's brand typeface, the four typefaces
  appear nowhere else: `pnpm --filter @raioviajante/design refrain-art` cuts
  them down to the characters the art draws (a test keeps the copy inside
  those sets) and they load only with the art
  (`@raioviajante/design/refrain-art.css`, OFL in the fonts folder). The
  record and sleeve keep their grooves, shine and shadows; while the card is
  hovered or focused the record slides out and turns, and under reduced
  motion it moves without a transition.
- **Delivery.** No server-rendered `style` attributes (the CSP blocks them):
  timings and positions are classes in `cards.css`, `pages.css`, `minis.css`,
  `catalog-minis.css` and `refrain-art.css`. The home page loads the cards
  and the sketches; only `/projects` loads the cases' art and the "show more"
  script.
- **Motion.** Looping animations play only while a card is hovered or has
  focus, and otherwise rest on a complete frame (WCAG 2.2.2). Everything
  stops under reduced motion.

### Cases: Stucco. and Quadra

Both cases share their page's parts: the facts, the tour
(`components/projects/CaseTour.tsx`), the demo layer (`CaseDemo.tsx`), the
numbered sections and the way back. Their cards share the browser and phone
of `stucco-art.css`.

#### Stucco. (client work)

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
- **Exceptions to the visual rules.** They apply to every case, only
  inside its approved design. Here the frames of the tour, the card art, the
  brand art and the demo layer have shadows, the card art has a photo scrim
  that repeats the demo's, and the layer's backdrop is blurred, as the
  gallery's is.

#### Quadra (academic project)

`/projects/quadra` and its Portuguese counterpart tell the events and
space-booking system Bryan made with Rafael for a university, reimagined as
the fictional Quadra (copy in `lib/quadra.ts` and `ptQuadraCopy`). The
institution is never named; the demo's people, groups and numbers are
invented, and the case keeps the original system and the portfolio concepts
apart. The credit links Rafael's LinkedIn profile, in a new tab. Images are
derived from the handoff by
`pnpm --filter @raioviajante/design quadra-art <handoff>` into
`packages/design/assets/projects/quadra/` and imported from the generated
`@raioviajante/design/quadra`.

- **Card.** The demo's screens in the browser and the phone, on the brand's
  court-blue background, with the same slideshow rules as Stucco.'s.
- **`/work/quadra/`.** The demo is the handoff's front-end build, about 20
  screens, unchanged except where the site's rules require: its two
  typefaces (Schibsted Grotesk and Geist Mono, OFL) are served from its own
  folder instead of Google Fonts, its icon is a file instead of a `data:`
  URL, and its state lives in the page's memory instead of `localStorage`,
  so a reload starts over and nothing is stored (the case and the demo say
  so). Its templates write `style` attributes, so `/work/quadra/*` alone has
  `style-src-attr 'unsafe-inline'`; its scripts stay as strict as everywhere
  else (`docs/security-headers.md`). When the demo uses Esc itself (a dialog,
  a drawer, a popover, its menu) it marks the key handled, and the demo
  layer stays open.

### Gallery

The gallery opens from an isolated, gently floating Work of Art cover, with a
small muted hint below the sticker. Activating its keyboard-accessible button
reveals or hides Branding, Profiles, and Personal, with a short unfolding motion:
the cover squashes and the stickers burst out of it to their places on the sheet,
with the `gallery-spread` voice. Activating it again gathers the stickers back into
the cover while the other sections fold away, with `gallery-gather`, and hides the
collection once those animations end; reduced motion opens and closes at once. Focus
stays on the cover, which scrolls into view as the collection enters normal document
flow. Reduced motion
stops the float and reveals immediately; without JavaScript the server-rendered
collection remains visible. The local export starts open and has no opening
choreography; this entry interaction refines it without changing the final layout.
Gallery artwork uses the shared `data-sound="gallery"` hover/click voice. The cover
keeps the hover voice but is marked `data-sound-on="hover"`: `GalleryBoard` plays its
one activation voice by hand (`gallery-spread`, `gallery-gather`, or the plain
`gallery` click under reduced motion), and the Personal pop below is the only other
manual sound dispatch. Thirty
stickers, laid out as one sticker sheet with a perforated edge and a printed label
(five across, three on narrow screens), share one transparent atlas (a 1080px AVIF preview, with the 2160px WebP
original reserved for the viewer and downloads); the avatar uses the existing shared animation
and shows its ten frames. Personal artwork forms a responsive overlapping collage on a
12-column grid, placed in reading order so keyboard order follows the layout. Each piece
pops in once as it scrolls into view, with the shared `gallery` voice (`lib/gallery-pop.ts`).
Only that script hides a piece, so without JavaScript, in print and under reduced motion
the artwork stays visible, and reduced motion also drops the sound.
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
This Site describes the root app and links to the public source repository.

### About and Contact

Both follow the handoff in `reference/new/` (local and untracked), with their
copy in `lib/about.ts`, `lib/contact.ts` and `ptAbout` / `ptContact`.

- **About** (`components/AboutPage.tsx`) carries the avatar above its title
  (the shared flipping avatar, at 96px) and Bryan's own words: who he is, what
  he does, three Dump posts about learning (real titles and paths in each
  language; the handoff's other two posts do not exist on Dump and are left
  out), the four places, "Right now" (each project's status from the projects
  copy, so it never disagrees with the cards), his tools as plain pills, a
  link to Setup and life away from the screen. It ends with the one
  invitation card on Root, to Contact. On phones each leader row becomes
  name over note.
- **Contact** (`components/ContactPage.tsx`, `ContactMail.tsx`) opens with a
  self-typing title (never under reduced motion), the "Hi!" sticker and
  "Open to new projects" as a word with a gray mark. The email card writes
  an email, copies the address (Root allows clipboard-write for this; the
  result is announced, and a failure says the address instead) and offers
  seven subjects as pressed buttons that fill the email's subject line and
  change a polite hint. Then six things he is up for, a guide to pitching
  with an example and three steps, four messages that are not work (each
  card an email with its subject) and the profiles from `lib/links.ts`,
  Dump's feed and the four places. On phones a "Write to me" button stays at
  the bottom once the card has scrolled past (`IntersectionObserver`;
  hidden and out of the tab order until then). The stickers ("Hi!", the
  thumbs-up that appears on copy, the one peeking with a cat) are cells of
  the gallery's sheet, decorative and without shadows; the cards carry no
  glyph icons, by the design rules.

The supplied Gallery export in the local `reference/` directory is the visual and
interaction specification for this redesign. It is locally excluded from Git; its
runtime and prototype source are not production dependencies.
