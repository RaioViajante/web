# raioviajante design system

> The implemented shared system for all four sites. Historical design decisions and unresolved facts are recorded in [design-migration-plan.md](design-migration-plan.md).

One visual identity for four sites with four different jobs.

| site             | job                     | signature features                                         |
| ---------------- | ----------------------- | ---------------------------------------------------------- |
| raioviajante.com | index: who, what, where | projects, latest writing, gallery                          |
| dump             | reading                 | series, related posts, comments, code walkthroughs         |
| docs             | reference               | left nav + "on this page", search, callouts, CLI reference |
| lab              | running things          | benches, fidelity, notebook                                |

The frame never changes between sites: owner location clock, sound toggle, language control, sidebar, centered page header, numbered sections, footer. Only what lives inside the frame does.

### Owner location clock

The shared utility row reads the owner's current location from
`site/owner-location.ts`. When traveling, edit only `ownerLocation.label` and
`ownerLocation.timeZone`, using a short label and an IANA timezone, then deploy
all four applications. For Dublin, for example:

```ts
export const ownerLocation = {
  label: "DUB",
  timeZone: "Europe/Dublin",
} as const;
```

The clock is not visitor-configurable and never uses browser location,
geolocation, IP detection or the visitor's local timezone.

---

## 0. Build once, reuse everywhere

Everything below that appears on more than one page or site is **one shared implementation**, imported by raioviajante.com, dump, docs and lab. Never copy markup or CSS between apps.

| shared piece                                        | used by          | pass in                                                 |
| --------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| `styles/tokens.css`                                 | all four sites   | —                                                       |
| Shell: sidebar + sound toggle + column + footer     | every page       | site, PAGES items, active item, optional "on this page" |
| Sound player + preference                           | every page       | `data-sound` on elements                                |
| Search menu item ("Ask RaioViajante")               | every sidebar    | number, shortcut label                                  |
| Search page                                         | all four sites   | the site's question, index scope                        |
| Index header (avatar, name, line)                   | every index page | name, line                                              |
| Section heading `01.1 Title`                        | everywhere       | number, title                                           |
| Dotted leader row                                   | everywhere       | label, value, href                                      |
| Soft blocks: code, terminal, diff, callouts, tables | dump, docs, lab  | content                                                 |
| Lab bench frame                                     | lab              | label, children                                         |
| Prev / next, related rows                           | dump, docs, lab  | links                                                   |
| Legal page template                                 | all four sites   | site-specific sections                                  |
| 404 page                                            | all four sites   | the site's line, "try instead" links                    |

**Images** live in `packages/design/assets/`, shared by all apps, never duplicated per site. Components import them from the package (`Art`, `art`, `gallery`).

| file                                            | where                                                                                                                                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `character/avatar.png`                          | index headers and social cards                                                                                                                                                         |
| `search/search-character.png`                   | search page, full pose next to the bubble (150px; 100px on phones). A 320px derivative of `search/source/search-character.png` made by `pnpm --filter @raioviajante/design search-art` |
| `search/head/static.png`                        | search menu item (30px) and "ask RaioViajante" rows (34px) — never below 28px                                                                                                          |
| `character/avatar-frames/frame-01…10.png`       | index avatar animation (224px, shown at 112px), via `components/avatar.ts`                                                                                                             |
| `search/not-found.png`                          | empty search (180px)                                                                                                                                                                   |
| `stickers/work-of-art.png`                      | root gallery                                                                                                                                                                           |
| `stickers/not-found.png` ("404 page not found") | every 404                                                                                                                                                                              |
| `icons/source.png` (winking head sticker)       | favicon, app and home-screen icons, generated by `scripts/icons.mjs`                                                                                                                   |
| `gallery/*.webp`                                | root gallery                                                                                                                                                                           |
| `projects/*.webp`                               | root projects pages and home: project icons (128px) and the Mochifile wordmark, derived from `projects/source/` by `pnpm --filter @raioviajante/design project-icons`                  |
| `projects/stucco/*.webp`                        | root Stucco. client case: tour, brand and card images, derived from a local kit by `pnpm --filter @raioviajante/design stucco-art <kit>`                                               |

All files are exports of the original artwork. The screenshot crops from the design handoff were not used.

## 1. Principles

1. **One typeface.** Noto Sans Mono sets everything. Hierarchy comes from size, weight and position.
2. **The page is gray.** Color appears only inside code blocks and lab bench output, where it identifies tokens.
3. **Words, rules and position carry meaning.** Status is a word. Warnings escalate by rule weight. Selection is an underline or a 1px left rule.
4. **Whitespace organizes, not boxes.** Only code blocks and lab benches get a frame.
5. **Soft blocks.** Everything that interrupts prose (code, terminals, notes, tables, lab benches) sits on one surface: `#212121`, 10px corners, no border, label above. Only warnings are outlined. Sections are never boxed.
6. **Sound and character are identity.** Every site uses the root's sounds, the avatar and the sticker.
7. **Never:** gradients, glow, shadows, bento grids, colored badges, emoji, a second typeface, an accent color for links. One exception: the root gallery's tiles keep their shadows (artwork pinned to a board). The pressed state of a leader row also keeps root's inset shadow. Root's client cases are the other exception, only inside each case's approved design: framed screenshots, printed pieces and the demo layer have shadows, and the card art repeats the demo's photo scrim and uses the client's typeface (`apps/root/docs/design.md`).

## 2. Tokens

All tokens live in `packages/design/styles/tokens.css`. The two `[CHECK]` values were resolved against the root site: `--bg` is `#191919` (the design measured `#1b1b1b`) and `--font` keeps the root's Noto Sans Mono stack.

| token           | value                      | use                                             |
| --------------- | -------------------------- | ----------------------------------------------- |
| `--bg`          | `#191919`                  | page (root's value)                             |
| `--fg`          | `#edf1f6`                  | text, titles, current item (root)               |
| `--fg-2`        | `#8792a1`                  | secondary text (root muted)                     |
| `--fg-3`        | `#8792a1`                  | section numbers, caps labels, meta (root muted) |
| `--line`        | `rgba(215, 223, 234, 0.3)` | rules, frames (root)                            |
| `--dots`        | `rgba(215, 223, 234, 0.3)` | dotted leaders (root rule)                      |
| `--rule-note`   | `#555555`                  | quotes, NOTE                                    |
| `--block`       | `#212121`                  | code blocks, benches                            |
| `--block-inner` | `#262626`                  | inline code                                     |

Project artwork: the code-drawn sketches inside Root's project cards use their own palettes (`--mochi-*`, `--ordelis-*`, `--refrain-*`, `--orbit-*`, `--yanawa-*`, `--sweep-*`, `--hum-*`, `--ferry-*`), declared as tokens in `styles/project-art.css` (exported as `@raioviajante/design/project-art.css`) and loaded only by the pages that show the sketches, so no other page or site carries them. As with code and bench output, color appears only inside those frames; their text pairs are held to 4.5:1 by `tests/contrast.test.ts`.

Syntax: keyword `#d8bd84` · type `#bfa6d9` · function `#8fb8d6` · string `#a8c791` · number `#de9f8c` · comment `#9aa3af` italic · punctuation `--fg-2`.

## 3. Typography

These are the root site's original values, restored after a before/after
comparison during the design migration. The root is the reference for the
system.

| role         | size / weight                              | where                                     |
| ------------ | ------------------------------------------ | ----------------------------------------- |
| index title  | clamp(35.2, 4.4vw, 45.76) / 650 / 1.28     | site index pages                          |
| page title   | clamp(35.2, 4.4vw, 45.76) / 650 / 1.28     | pages, docs, experiments (post title 44)  |
| section      | 17.95 / 650, number 16.5 / 500 in `--fg-3` | everywhere; number column 52.8px          |
| body         | 16.5 / 500 / line-height 1.82              | everywhere; root computed size            |
| sidebar item | 15.84 / 500, padding 4.4px 13.2px          | PAGES, ON THIS PAGE, EXPERIMENTS          |
| code, tables | 13–13.5 / 1.75                             | everywhere                                |
| caps label   | 13.73, uppercase, +0.08em                  | page label, sidebar groups, table headers |
| sound toggle | 14.08 / 500                                | top center of the content column          |
| footer       | 12.32 / line-height 1.9                    | everywhere                                |

Layout: shell 1320px wide, sidebar 228.8px, gutter 61.6px, content column
739.2px, section gap 42.24px. Interaction (tokens `--hover-*`, `--ease-*`,
`--press-*`): sidebar items brighten in 220ms; a linked leader row brightens
its name (`--hover-label`), brightens and scales its value by 1.8%
(`--hover-note`, 560ms), and presses in on `:active`; footer links go to
`--hover-link` in 420ms; the selection and the focus ring use `--accent`
(`#b9a1d2`), never links. The sidebar's current item has a 1px `--fg-2` rule.

## 4. Structure (shared by all sites)

- **Sound toggle** — `SOUND ON` at the top center of the **content column** (not the page), exactly like the root.
- **Sidebar** — caps group labels; items numbered `00.`, `01.`; the current item has a 1px `--fg-2` rule on its left. Groups: PAGES, ON THIS PAGE where useful, EXPERIMENTS on lab. **No SITES group** — the footer links the sites. Search is the last item of PAGES, numbered after the site's last top-level page: `NN. search ····· (avatar) ⌘K`.
- **Page header** — centered: caps label (or breadcrumb in caps on docs), title, one line, meta row separated by middots. The first meta item is the status word in `--fg`.
- **Numbered sections** — `01.`, `01.1`, `01.2`. The same numbers appear in "on this page".
- **Dotted leader** — `name ····· value` for lists, metadata, statuses, tags, related links.
- **Soft blocks** — callouts NOTE / IMPORTANT on `#212121`; WARNING outlined 1px `--fg-2`; DEPRECATED dotted. Quotes keep a 2px left rule.
- **Related rows** — `title ····· site ↗`, linking to pages about the same thing on the other sites. Today every experiment lists its related posts and docs; a post links its Lab experiment where one exists ("try it"); the Sweep guide links its experiment and posts from its own "try it and read more" section. Not every post or docs page has such links.
- **Prev / next** — caps label above title, no box.
- **Footer** — the same on all four sites: four sites (none marked as current), email, CNPJ, and that site's own Terms of Use and Privacy Policy. Dump, Docs and Lab add one line, "About these sites", to Root's page about all four (`ABOUT_SITES_PATH` in `site/sites.ts`), chosen per locale like the other cross-site links; Root lists that page in its own PAGES instead.
- **Index header** — avatar (112px circle), site name, one line — like the root.
- **Search ("Ask RaioViajante")** — menu item ends in the hand-on-chin head (30px, peeking above the row) and `⌘K` (ctrl K off Mac, `/` also opens); on hover the head hops once and a "?" sticker bubble pops. The search page: the full search character asks in a white sticker bubble in the site's voice (root: "what are you looking for?", dump: "what are you curious about?", docs: "what do you need to look up?", lab: "what do you want to poke at?"); the bubble answers while you type ("found 4 things about “sweep”!", "hmm… nothing yet."); results are numbered leader rows grouped by site; scope "this site · everywhere"; empty search shows the sticker, "maybe I haven't built it yet." and a quiet sentence, "try …", in small `--fg-2` text. Under "this site" it lists the site's own terms (root: projects, setup, about, gallery; dump: orbit, assembly, language, scheduler; docs: sweep, cli, tokens, commits; lab: classifier, boot, execution); under "everywhere" it lists one signature term from each other site (setup, assembly, cli, classifier). The words are buttons in the sentence's color, set apart only by weight, and only brighten on hover or focus, like every other link; a suggestion fills the query. The selected result row is marked with `aria-current`.
- **Shared catalogs and LANG** — `packages/design/catalog.ts` holds one complete `SharedCatalog` per registry locale (`en`, `pt-BR`) for the strings the package itself renders: shell chrome, footer labels, the sound control, `LANG`, search, pager and the shared 404 copy, and the soft-block controls and labels (`blocks`: copy, copied, show all N lines, callout labels, footnote and sideways-scroll names). `Record<LocaleId, SharedCatalog>` makes a missing locale or key a type error, and `catalogFor` throws for an unknown locale: there is no English fallback. Page prose, taglines, project and experiment text, legal bodies and each app's 404 voice stay in the apps. Shared components take the rendered `locale` explicitly (the route states it; nothing is read from the browser). The sound toggle is rendered with `data-sound-locale`, so `initSound` repaints from the same catalog. `LanguageControl` (inside the utility header; its compact identity is the fixed token `LANG` plus the registry label in every locale: `LANG EN`, `LANG PT`; every accessible name begins with that exact text, then a dash and the explanation in the page's language, for WCAG 2.5.3) is navigation, not state, and renders as static markup: participation is checked first, so while either locale does not participate it is a noninteractive `LANG EN` / `LANG PT` status with no link or disclosure (today, on every page of all four apps); otherwise a link to the app-supplied real counterpart, or a native `<details>` that says the page is missing and links the other locale's home, or, on the search page, the other search page, where the shared script adds `q` and nothing else. Each language name carries `lang` and each destination `hreflang`. The footer's cross-site links choose a destination per target host (`footerDestination`): the localized home only when both the rendered app and the target participate in the locale, otherwise the English host, which then says so inside the link ("dump (em inglês)") and carries `hreflang="en"`; nothing is probed. Browser coverage (`e2e/lang.spec.ts`) renders the real `LanguageControl` markup into a styled app page to check the link, disclosure, `q` carrying, focus, 44px targets, phone overflow and axe. Nothing is stored; the `rv-sound` cookie remains the only preference.
- **Search locale** — the route states the search locale (`SearchPage`'s `locale` prop, rendered as `data-search-locale`); the client never infers it from the browser and stores nothing. Since the English producers all publish `locale` (#42), readers require it: `validateIndex` rejects a response whose entries have a missing, unsupported or different locale, or another site, and never filters a bad entry. Participation gates federation only. The current host's own index is always read for the route's locale: `loadCurrentSiteIndex` returns a typed `ready` or `unavailable` state (exposed as `data-search-state`), so a published but not yet advertised locale searches its own index. `loadFederatedSiteIndex` adds the `skipped` state: a non-participating peer host is never requested or probed. "Everywhere" stays inside one locale; `loadEverywhere` validates `own` and each participating host's response against the site and locale before merging, so a host that answers with another site or locale is `unavailable` and the rest still search. It reports `unavailable` hosts apart from `skipped` ones, and an active empty index (`[]`) is a success. Matching uses one rule for both locales (`normalizeSearchText`): lower-case with the registry `Intl` locale, Unicode-decompose, drop combining marks, so "configuração" matches "configuracao". Dates use the registry `Intl` locale in UTC. `searchPagePath`, `searchIndexPath` and `searchLocaleHref` (carries `q` only, only between participating locales) build paths from the registry; they do not publish any Portuguese route. The "nothing found" suggestions (`SearchPage`'s optional `suggestions`: one list for "this site", one for "everywhere") are terms taken from each locale's published index, never English defaults shown in Portuguese; each app keeps its own lists in its catalog (Docs: [apps/docs/docs/design.md](../apps/docs/docs/design.md)) and a build test fails if one finds nothing in its built index.
- **Legal pages** — Terms of Use and Privacy Policy on every site: "In short" leaders first, then numbered sections; site-specific sections (dump comments via giscus, docs accuracy/search, lab experiments).

## 5. Site features

### dump

- Index: latest post featured, posts by month, series, follow along (RSS, GitHub).
- Post: reading progress line, "on this page" in the sidebar, numbered sections, code blocks (file name, language, copy, line numbers, highlighted lines), notes, metadata leaders, prev/next, related by tag, **try it in the lab**, comments (giscus with a custom theme built from these tokens).
- Archive and tags as leader lists; tags split into recurring / once.
- Search: numbered sidebar item `03. search  /`, opens the shared search page.
- The separate About page was removed; the root About covers it.

### docs

- Home: animated avatar, projects with status and raioviajante standards. Search is only in the sidebar.
- Two columns: sidebar (pages and "on this page") and content.
- Guide pages: breadcrumb label, status, steps, tables, callouts, **try it and read more**, last updated and edit on GitHub. Last updated comes only from explicit ISO-date `lastUpdated` frontmatter (never git history) and is omitted when absent.
- Reference pages render verified commands and behavior. Unknown versions, exit codes and changelogs are omitted. Tabs and file trees are shared capabilities, used only where content needs them.
- Search: the sidebar item after the last top-level page (`NN. search  /`), the only search entry point (the docs home has no search line of its own). It opens a full search page (no icon, no box, no key chips): caps label, plain input, results as numbered leader rows, selected result marked with the sidebar rule. "This site" searches docs pages and their sections; "everywhere" adds the indexes of the other three sites. Shortcut `/` on every site.
- **Design language** page rewritten for this system (the old one described a purple accent and serif prose).
- Callout and code styles: see `blocks/` (soft direction) — same rules on docs.

### lab

- Index: filter all / active / done, fidelity explained, notebook.
- **Fidelity** on every experiment: `runs here` (real logic in the browser), `simulated` (rules ported from a pinned revision), `source only` (real code, documented results).
- Experiment template: header `EXPERIMENT NNN · PROJECT` → 01 Question → 02 Bench → 03 Fidelity → 04 Related → prev/next. Numbers have three digits and are never reused.
- Bench: framed like a code block; caption states where it runs; bands for controls, output, state and history.
- Controls: accepted actions solid, rejected actions dotted but still clickable, one primary at most, underline toggles.

### Shared extras

- **404** — one design for all four sites (Next's not-found page on root and dump, `404.html` on docs and lab): the "404 page not found" sticker floating gently, "I looked everywhere.", a line in the site's voice, the requested path in a soft block, "Try instead" leaders for that site, and "ask RaioViajante ⌘K". Build it **once** as a shared component; each site only passes its line and its links.

## 5b. Sound

Sound is part of the identity. Every site uses the same Web Audio synthesis and cookie preference as raioviajante.com.

| event               | where                               | sound                                         |
| ------------------- | ----------------------------------- | --------------------------------------------- |
| toggle sound        | SOUND ON / OFF                      | `[ROOT: toggle]`                              |
| hover nav item      | sidebar, leaders                    | `[ROOT: hover]` — very soft, max one per 80ms |
| open link / page    | any link                            | `[ROOT: click]`                               |
| open search         | sidebar item or `/`                 | `[ROOT: open]`                                |
| type in search      | search input                        | `[ROOT: tick]` — quietest, throttled          |
| move selection      | ↑ ↓ in results                      | `[ROOT: hover]`                               |
| copy                | code, terminal                      | `[ROOT: copy]`                                |
| switch tab / filter | docs tabs, lab filter, search scope | `[ROOT: click]`                               |
| expand / collapse   | long code                           | `[ROOT: click]`                               |
| action accepted     | lab bench                           | `[ROOT: success]`                             |
| action rejected     | lab bench                           | `[ROOT: reject]` — never harsh                |

Rules: never play on page load; one preference across subdomains (localStorage is per subdomain, so the preference is the `rv-sound` cookie on `.raioviajante.com`; reads have no side effects, and an old localStorage value is honored until the next explicit toggle, which writes the cookie and removes it). There are no audio files: every sound is synthesized with Web Audio in `packages/design/sound/`, and `[ROOT: name]` means the voice the root already synthesizes for that kind of event. Under reduced motion, hover and typing sounds are skipped; sounds that confirm an action still play. `data-sound-on="click"` keeps a control silent on hover; `data-sound-on="hover"` keeps its hover voice but leaves the activation to the control itself, which must then call `playSound` (the Root gallery cover). Hover sounds need the visitor's pointer to move: a control the page scrolls or animates under a resting pointer plays nothing (the browser re-fires `pointerover` at the last moved-to spot; a real entry arrives at new coordinates first). One deliberate exception plays per item: the Root gallery's Personal artwork pops in with `[ROOT: gallery]` as it scrolls into view, only after the visitor has opened the collection, and never under reduced motion (`apps/root/docs/design.md`). The same gallery has two voices of its own, timed to its animations: `gallery-spread` when the cover opens the collection and `gallery-gather` when it closes it; both are skipped under reduced motion, where nothing animates.

## 5c. Motion

When a page appears, the chrome stays still and only the content of `<main id="main">` enters top to bottom in a short, slightly springy cascade. One implementation: `packages/design/motion.ts` (started last by `startBehavior()`; `attachMotion()` returns a stop function) and `styles/motion.css`. Motion has no sound: navigation keeps the existing nav click, and this cascade plays nothing on load or per item (5b).

- **What moves.** Only targets inside `main`. `selectTargets` walks the page with a small selector list: `.rv-leader` and `[data-motion]` always move on their own; `section`, `article`, `.rv-header`, `.prose`, lists directly in a `.rv-section`, and `[data-motion-group]` are walked into; every other child is one target (a heading, a paragraph, a soft block, a bench, the pager). Apps mark their own items rather than adding CSS: Root's project cards carry `data-motion="card"`, Lab's index entries `data-motion`; `data-motion="off"` opts an element out. Hidden, empty and absolutely or fixed positioned elements never move.
- **Chrome.** The sound bar, the sidebar and the footer never move, on the first page or after a navigation. A first-visit cascade of the sound bar and sidebar was considered and dropped: it needed a `sessionStorage` flag, and the sites store nothing but the sound preference ([privacy-storage.md](privacy-storage.md)).
- **Order and timing.** Targets are ordered by their box: top first, then left to right when tops are within 12px, so the left card of a two-column row comes first. Tokens in `tokens.css` (mirrored in `motion.ts`, kept equal by a test): `--enter-stagger` 65ms between targets, compressed so the last delay never exceeds `--enter-cap` 450ms; opacity 0 → 1 over `--enter-fade` 180ms ease-out; a Web Animations spring from `--enter-rise-y` 12px with a 0.99 / 1.01 squash over `--enter-rise` 280ms. Project cards and the index avatar use `--enter-bounce-y` 28px, 0.95 / 1.035, over `--enter-bounce` 500ms. Only opacity and transform change: no layout shift.
- **The fold.** Only targets in the first viewport cascade on arrival. A target below waits (`data-motion-state="waiting"`, opacity 0 in `motion.css`) and enters once when it scrolls 40px into view, batched with the same stagger and cap. A target above the viewport (anchor jump, restored scroll, End) is shown at once, never left hidden.
- **Nothing hidden without a way back.** Nothing is hidden before the script runs, and content a document already painted is not hidden again: when the first contentful paint happened before the script (usual for a Next hard load, which hydrates after painting), the first viewport stays as it is and only below-the-fold targets wait. No inline style is written: a cascading target is held at its first keyframe by its own animation (`fill: "backwards"`), and cancelling it shows the element as its stylesheet says. Without `animate`, `IntersectionObserver` or `matchMedia` everything is visible. Focus inside a pending target shows it at once; a pointer press shows a waiting target but never snaps a moving one, which could slide it out from under the pointer and lose the click; the element holding focus is never moved. A click on a link to a fragment of the same page (before the browser scrolls, so it lands on the resting position), an anchor jump (`hashchange`), a hidden document, `pagehide`, printing (`beforeprint`, and `@media print` shows waiting targets without the script), a route change or switching reduced motion on settles everything. A page opened at a fragment (`/projects#id`, on a first load or a client-side navigation) gets no motion at all: its destination is shown as it is. The rise is added to an element's own transform (`composite: "add"`), so an element that already moves, such as the floating 404 art, does not jump when it ends.
- **Reduced motion.** No cascade and no transform: content is simply visible. The media query is followed while the page is open; switching it on settles everything at once. Scripts in the packages and apps read the preference through `@raioviajante/design/reduced-motion` (`prefersReducedMotion()` for a reading now, `reducedMotionQuery()` to follow changes), so motion and sound always agree; CSS keeps its own `@media` rules. A repository test (`security/boundaries.test.mjs`) fails on any other `matchMedia` call for the query in a TypeScript, JavaScript or Astro source file. Static client demos under an app's `public/` (Root's `/work/stucco/`) keep their own code and are not checked.
- **Next.js (Root, Dump).** Navigation is client-side. The motion script watches the body and treats a changed pathname with a new `<main>` as a new page, settles the old page's pending work and cascades the new content. No `next/navigation` hook is needed.
- **Astro (Docs, Lab).** Each page is a new document and runs the same cascade when it loads; there is no `ClientRouter`, no `client:*` and no browser React. There is no cross-document view transition. One was built (`@view-transition { navigation: auto }`, the sound bar and sidebar as their own transition groups, a 150ms fade of the old page) and removed before release: in headless Chromium 153 under Playwright, the new page often skipped the transition and raised an unhandled "Transition was aborted because of invalid state. ViewTransition opt-in disabled" page error, which fails `pnpm browser:check`. It happened with the opt-in at top level or inside a media query, without the named groups, with a `rel=expect` render-blocking hint and without the motion code; it did not happen when the new page ran no script. A second attempt kept the opt-in and the named groups and caught the promises of a skipped transition (`.catch()` on `ready`, `finished` and `updateCallbackDone` from `pagereveal` and `pageswap`, in the shared behavior); `pnpm browser:check` still failed the same 6 tests with the same error. A probe showed why: whenever the error appears, the new page's `pagereveal` fires about 8 ms in, before the shared script registers, and its `viewTransition` is `null` even for the earliest possible listener (a Playwright init script). Chromium rejects a transition it never hands to the page, so no page code can catch it, although the stylesheet carrying the opt-in is render-blocking in the `<head>`. Revisit it with a browser that reveals the new page reliably.
- **Across sites.** Root, Dump, Docs and Lab are different origins: a link between them is a full cross-origin navigation, which could never get a view transition. The new page's cascade runs as on any first load.

## 6. Interactive behavior (lab)

Static React renders the initial state; plain TypeScript Astro scripts run the benches. Pure logic and pinned provenance live in `apps/lab/src/lib` and `apps/lab/src/data`.

- **001 filename classifier** — directory + filenames (one per line) → suffix, category, destination, counts. Suffix mirrors Python 3.14 POSIX `Path.suffix`, lowercased for matching; `.hidden` has none and `image.` has suffix `.`. Spaces are preserved. Categories are the ones on the docs Sweep page.
- **002 execution states** — actions start / succeed / fail / cancel. Rejected actions log `rejected: <action> from <STATE>` and change nothing. Rules are verified against Orbit `cd97666`, including Java blank-message and signed integer rules. Times come from the browser clock. "new example" resets.
- **003 boot sector** — five sections verified against x86-os-experiment `e966889`, source and notes, previous/next, progress `n / 5`. It does not emulate a machine.

Implementation: Shiki with a custom theme mapped to the syntax tokens (`packages/design/blocks/`), a build-time static search index per site merged client-side for "everywhere" (implemented), and `@raioviajante/design` imported by all four apps.

## 7. Verified facts and omissions

The handoff's open checks, as they stand:

- `[CHECK]` values in `tokens.css`: resolved (see section 2).
- Orbit rules are verified: start from QUEUED; succeed/fail from RUNNING; cancel from QUEUED/RUNNING.
- Boot source and notes are verified at `e966889`; the original `[NOTE FROM LEARNING NOTES]` placeholders are not published.
- Placeholders such as `[VERSION]`, `[DATE]`, `[REVISION]`, `[COMMIT]`, exit codes, changelog entries and install commands are never rendered; an unknown fact is omitted.
- Dump series derive from real posts; reading time is computed at 220 words per minute.
- Legal pages: every `[CONFIRM]` fact (license, host, analytics, retention, governing law) is omitted until the owner supplies it ([operations.md](operations.md), "Deferred and accepted"). The template is not legal advice.
- Artwork: the shared package ships the original artwork.

## 8. Metadata, accessibility and delivery

Every indexable page has its own title, description, canonical URL and 1200×630
PNG for Open Graph and Twitter. `seo/metadata.ts` owns URL and metadata conventions;
`social-image.tsx` owns the shared avatar/site/title composition and reads token
colors at build time. Apps own their route inventories. Sitemaps include search
and legal pages but exclude 404 and image endpoints; robots points at the
canonical sitemap. Dump keeps RSS. No publication or modification date is invented.

The local Noto Sans Mono variable Latin WOFF2 is preloaded by each app, with
optional font display to prevent a late font swap. Next uses `next/font/local`;
Astro uses `fonts.css`. Static TTF weights and their OFL license live in
`packages/design/fonts` for social rendering. Images reserve dimensions and
load lazily below the fold. No React runtime hydrates Astro pages.

Landmarks are the banner (sound toggle), the sidebar with its navigation, one
main and the footer. Buttons, tabs, toggles, inputs and search controls have a
44px target. Link lists (sidebar, leader rows, footer) keep their compact
rhythm and meet the WCAG 2.2 24px target spacing; inline prose links retain
text flow. Regions that scroll sideways (wide tables, long code lines) become
focusable, labelled regions only while they overflow (`scroll-regions.ts`). Keyboard focus uses
the shared outline, search and lab use live feedback, and all animation stops
under reduced motion. Code comments and line numbers use `#9aa3af`; highlighted
lines use `#2a2a2a` to preserve at least 4.5:1 text contrast. Incidental sounds
are suppressed under reduced motion; explicit action confirmation remains.

Empty search results use `search/not-found.png`.

Icons: `pnpm --filter @raioviajante/design icons` builds `favicon.ico` (16, 32,
48), `icon.png` (512), `icon-192.png`, `apple-touch-icon.png` (180, on `--bg`)
and `icon-maskable.png` (512, art in the safe zone, on `--bg`) from
`assets/icons/source.png`, then copies them to the fixed URLs each host serves
(`app/` file conventions on Next.js, `public/` on Astro and for the manifest
icons). These copies are the one exception to "never copy artwork into an
app"; they are generated, and a test fails if any copy differs. Every site
serves `manifest.webmanifest` from the shared `webManifest`.
