# Design migration plan

Migration of raioviajante.com (root), dump, docs and lab to one shared design
system in `packages/design`. Two agents (Claude and Codex) work on it in
sessions, on the same branch, `feat/design-migration`.

This file has four parts:

1. [The brief](#1-the-brief): the full spec, saved verbatim from the first session.
2. [Audit and plan](#2-audit-and-plan): what the repo looked like, the target structure, decisions and deviations.
3. [Status](#3-status): what is done, with paths.
4. [Next session](#4-next-session): exact instructions for the next agent.

Repo rules for agents are in `AGENTS.md` and `CLAUDE.md` (section "Design system
migration"). Design rules and tokens: [design-system.md](design-system.md).
Blocks: [blocks.md](blocks.md).

---

## 1. The brief

The text below is the original prompt. Its wording is unchanged (Prettier only normalized blank lines). Where later sections of this
file differ from it, section 2.5 ("Decisions and deviations") says why.

````markdown
# Design migration: raioviajante ecosystem

## Session rules (read first)

We are splitting this migration between two agents (you and Codex), working in sessions on the same branch, `feat/design-migration` (already created and checked out; do not create another branch).

The design reference folder `raioviajante-design/` is LOCAL ONLY and git-ignored on purpose:

- Never commit it. Never run `git add -A` or `git add .`; stage files explicitly.
- Copy (do not move) artwork from `raioviajante-design/art-concepts/` into `packages/design` with the new names.
- Do not delete `raioviajante-design/` at any point. List it as safe to delete in the final report and I will remove it myself.
- Docs that must live in the repo (design-system, blocks) are copied into `docs/`, not linked.

Decisions already made, keep them:

- The shared home is the existing `packages/design`. Everything shared goes there.
- Root sounds are synthesized with Web Audio; there are no audio files. Move that synthesis into `packages/design` as the shared sound module and map every event in the sound map (DESIGN-SYSTEM.md, section 5b) to a synthesized sound. `[ROOT: name]` in the design means "the sound the root already synthesizes for that kind of event".

In THIS session do only Phase 0, Phase 1 and Phase 2. Then:

- commit everything (Conventional Commits, English, no push),
- save this entire prompt inside `docs/design-migration-plan.md` so the next agent has the full spec,
- update the plan with a "Status" section (done, with paths) and a "Next session" section with exact instructions for Phase 4,
- write the repo rules into `AGENTS.md` and `CLAUDE.md` (same content) so both agents follow them.

---

You are migrating four sites — raioviajante.com (root), dump, docs and lab — to one shared design system. The complete design lives in `raioviajante-design/` at the repo root. The result must be pixel-faithful, fully reusable, and leave a clean, professional tree. Correctness beats speed.

## Sources of truth (read all before writing code)

1. `raioviajante-design/DESIGN-SYSTEM.md`: rules, shared pieces, site features, sound map, open questions. Section 0 "Build once, reuse everywhere" is mandatory.
2. `raioviajante-design/tokens.css`: tokens and reference classes.
3. `raioviajante-design/blocks/`: code and content blocks (BLOCKS.md, blocks.css, blocks.js, blocks-demo.html).
4. `raioviajante-design/{dump,docs,lab}/*.html`, `raioviajante-design/404.html` and `index.html`: visual references for every page. Open them in a browser.
5. `raioviajante-design/source/**/*.dc.html`: original design files. The `class Component` at the bottom of each holds the interactive logic (lab experiments, search filtering, tabs).
6. `raioviajante-design/art-concepts/`: ALL original artwork, including the search-icon animation frames 1–10.
7. The current root site (raioviajante.com). Its existing CSS, font and Web Audio sounds are the source of truth for any value marked [CHECK].

## Repository conventions (must follow)

- Everything in English: code, comments, filenames, commit messages, docs.
- Conventional Commits, one coherent change per commit, review the diff before each commit.
- Never push, never amend, never rebase shared commits, never force-push.

## Phase 0 — audit and plan

- Map the repo: how each of the four sites is built (framework, router, styling, content pipeline, deploy), the workspace setup, and what `packages/design` already contains.
- Write `docs/design-migration-plan.md`: target structure, every file to copy or rename, every shared module to create or extend, how each app consumes them, the test plan, and every [CHECK] / [CONFIRM] / placeholder you found.
- Continue without waiting, unless something is destructive or truly ambiguous.

## Phase 1 — one shared home for everything shared

Extend `packages/design`. Every app imports from it; nothing shared is copied into an app.

```
packages/design/
  styles/      tokens.css, base.css, blocks.css   (from the design; resolve [CHECK] values from the root CSS)
  assets/
    character/avatar.png
    stickers/work-of-art.png
    stickers/not-found.png
    search/search-character.png
    search/head/frame-01.png … frame-10.png   (from art-concepts icons 1–10)
    search/head/sprite.webp (+ sprite.png fallback), static.png
    gallery/<descriptive-kebab-name>.png      (every gallery artwork)
  sound/       the root's Web Audio synthesis, as a shared module
  components/  (framework components, see Phase 2)
```

- Open every file in `art-concepts/`, identify it by content, and copy it with a kebab-case name by subject. Gallery examples: `graveyard-run`, `sunset-guitar`, `purple-portrait`, `black-cats`, `calves-playing`, `cow-muhh`, `mirror-donkey`, `laboratory`, `hospital-bed`, `work-of-art`.
- Use the ORIGINAL artwork from `art-concepts/`, never the crops in `raioviajante-design/assets/` (those were screenshot placeholders).
- Optimize every image: right-sized exports, modern formats with fallbacks, explicit width and height, lazy loading below the fold.
- Serve images through the shared package, using static imports or a single build-time copy step. Committed duplicates per app are not allowed.

## Phase 2 — shared components, built once

Implement every piece in DESIGN-SYSTEM.md section 0, configured by props:

- **Shell:** sidebar (PAGES, optional ON THIS PAGE, lab EXPERIMENTS), sound toggle at the top center of the content column (not the page), the 740px content column, and the footer (four sites, email, CNPJ, that site's own Terms and Privacy).
- **Page parts:** index header (avatar, name, line); numbered section heading; dotted leader row; prev/next; related rows.
- **Soft blocks** per `blocks/BLOCKS.md`:
  - code with build-time syntax highlighting (Shiki or similar, with a custom theme mapped to the `--syn-*` tokens, no stock theme), optional line numbers and highlights;
  - file tabs, terminal (copy commands only), diff, annotated code, auto-collapse over 20 lines;
  - callouts (note, important, warning, deprecated, TIL, careful), tables, figures, file trees, footnotes.
    Wire them into each site's markdown/MDX pipeline with the fence syntax in BLOCKS.md.
- **Sound:** one player module plus a preference shared across subdomains (cookie on `.raioviajante.com`; migrate the root's current storage), driven by `data-sound` attributes, implementing the full sound map with synthesized sounds. Never play on load; respect reduced motion.
- **Lab:** bench frame, state marks, accepted/rejected controls.
- **Templates:** legal page and 404 page.

## Phase 3 — search: "Ask RaioViajante" (on all four sites)

- **Menu item:** the last item of PAGES on every site, root included: `NN. search ····· (head) ⌘K`.
  - The head is 30px and peeks 7px above the row.
  - On hover or focus it plays the 10-frame animation once (sprite plus CSS `steps(10)`), and the "?" sticker bubble pops in at 150ms.
  - With reduced motion, show the static frame and the bubble only.
  - Show "ctrl K" instead of ⌘K off macOS.
- **Shortcuts:** ⌘K / Ctrl+K and `/` (ignored while typing in inputs) open search on every site.
- **Search page** (shared component, one per site):
  - The search character with a white sticker bubble asking in the site's voice: dump "what are you curious about?", docs "what do you need to look up?", lab "what do you want to poke at?", root "what are you looking for?" (confirm the root line with me in your final report).
  - The bubble answers while typing: "found 4 things about “sweep”!", "hmm… nothing yet."
  - Scope toggle: this site / everywhere.
  - Results grouped by site as numbered leader rows: section numbers on docs, dates on dump, 001–003 on lab.
  - Arrow keys, Enter and Esc work.
  - Empty state shows the work-of-art sticker with "maybe I haven't built it yet." and suggestion chips.
- **Index:** build-time static JSON per site (or Pagefind), merged client-side for "everywhere". No server and no tracking.

## Phase 4 — migrate each site

Match the reference HTML for every page, at 1440px and 390px.

- **root:** keep its content and pages. Adopt the shared shell, tokens and footer. Add the search item and page. Add the **404 page** (`raioviajante-design/404.html`). Align its existing Terms and Privacy pages to the template without changing their legal text.
- **dump:** posts, archive, tags, post (TOC in the sidebar, computed reading time, series, related by tag, "try it in the lab", giscus with a custom theme built from the tokens), search, terms, privacy, 404. Remove the About and Uses pages, and redirect their old URLs to the root.
- **docs:** home (with the dotted search row), guide and reference layouts (breadcrumb label, status word, last updated, edit on GitHub), the rewritten design-language page, search, terms, privacy, 404.
- **lab:** experiments index (filter, fidelity, notebook), search, terms, privacy, 404, and the three experiments made fully interactive using the logic in `source/lab/*.dc.html`:
  - filename classifier;
  - execution states (verify the transition rules against the Orbit source and report differences);
  - boot sector explorer (replace the reconstructed code and notes with the real revision e966889).
- Wire every site's host 404 to its 404 page.
- Never invent facts. Keep every `[CONFIRM]`, `[DATE]` and `[VERSION]` placeholder, and list them in your report.

## Phase 5 — features to finish

- **AGENTS.md / CLAUDE.md** with the design rules: shared-only components, no hardcoded colors, no icons where a word works, no duplicated assets, sound and character usage.
- **SEO:** titles, descriptions, canonical URLs, Open Graph images generated in the brand style, sitemap, and RSS kept on dump.
- **Accessibility:** semantic landmarks, focus-visible styles, 44px touch targets, 4.5:1 contrast, aria-live on the search bubble and on lab results.
- **Performance:** no layout shift from images or fonts, fonts self-hosted or preloaded, minimal client JavaScript.

## Phase 6 — verify, then clean up

- Run lint, typecheck, tests and a production build for every app. Fix everything.
- Use Playwright to screenshot every page at 1440 and 390 and compare against the reference HTML. Fix visual differences. Run axe on every page.
- Keyboard test: ⌘K, `/`, arrows, Enter, Esc, tabs, copy buttons, every lab experiment.
- Only after all checks pass, in a final separate `chore:` commit, delete what the migration made obsolete inside the repo: duplicated per-app assets and styles, old components replaced by shared ones, and dead code. Before that, copy `DESIGN-SYSTEM.md` to `docs/design-system.md` and `blocks/BLOCKS.md` to `docs/blocks.md`, with paths updated. Do NOT touch `raioviajante-design/`.

## Final report

- the final tree of shared and app folders;
- every copied or renamed artwork (old → new);
- every deleted path;
- every placeholder still open;
- any differences from the design, and why;
- the commit list.

Do not push.
````

---

## 2. Audit and plan

### 2.1 The repo today

| App  | Package              | Framework                                                      | Router and content                                                                                                                            | Styling                                                                               | Tests                                              |
| ---- | -------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| root | `@raioviajante/root` | Next.js 16 App Router, React 19                                | pages in `app/` (about, contact, gallery, privacy, projects, setup, terms, this-site); content in `lib/*.ts`; gallery images in `public/art/` | `app/globals.css` plus `@raioviajante/design/editorial.css`; font through `next/font` | none; `format:check`, `lint`, `typecheck`, `build` |
| dump | `@raioviajante/dump` | Next.js 16 App Router, MDX (`@next/mdx`, `rehype-pretty-code`) | posts in `content/posts/*.mdx`; routes `posts/[slug]`, `archive`, `tags`, `about`, `uses`, `rss.xml`, `sitemap`, OG images                    | `app/globals.css` plus `editorial.css`; font files in `assets/fonts`                  | Jest, 23 suites                                    |
| docs | `@raioviajante/docs` | Astro 7 with Starlight                                         | Markdown in `src/content/docs`, custom Starlight overrides in `src/components/overrides`                                                      | `src/styles/theme.css`; fonts from Google Fonts (IBM Plex Mono, Source Serif)         | `astro check` only                                 |
| lab  | `@raioviajante/lab`  | Astro 7, no UI framework                                       | `src/pages/index.astro`, `experiments/[slug].astro`; data in `src/data/experiments.ts`; logic in `src/lib/`                                   | `src/styles/global.css`, consumes the old `tokens.css`                                | `astro check` only                                 |

- Workspace: one `pnpm-workspace.yaml`, one `pnpm-lock.yaml`, pnpm 12.8.1, Node 24.
- Deploy: four Vercel projects with Root Directory `apps/<app>` (see [deployment.md](deployment.md)).
- `packages/design` before this work: `tokens.css` (five dark color primitives, used by lab), `editorial-tokens.css`, `editorial.css` (root and dump shell), `editorial-sound.ts` (root and dump sound synthesis).
- The root and dump sound toggles each kept their own copy of the toggle component and stored `rv-sound` in localStorage.
- The design handoff pages are static snapshots with inline styles; `tokens.css` in the handoff holds the reference classes. The handoff `index.html` is a hub of the whole bundle, not the real root index page.

### 2.2 Target structure

```text
packages/design/
  styles/        tokens.css, base.css, blocks.css, index.css
  assets/
    character/   avatar.png, head-box.png
    stickers/    not-found.png, work-of-art.png, work-of-art-pt.png, sitting.png, sticker-sheet.png
    search/      search-character.png, head/ (frame-01…10.png, sprite.webp, sprite.png, static.png)
    gallery/     nine .webp files
  sound/         events.ts (the sound map), synth.ts, preference.ts, player.ts, init.ts, index.ts
  blocks/        theme.ts, highlight.ts, meta.ts, model.ts, build.ts, rehype.ts, client.ts, index.ts
  components/    Shell.tsx, page.tsx, blocks.tsx, lab.tsx, templates.tsx, art.tsx, gallery.ts, sites.ts, index.ts
  behavior.ts, behavior-react.tsx
  tests/         blocks, components, sound
  (kept until the apps move: tokens.css, editorial-tokens.css, editorial.css, editorial-sound.ts)
```

How apps consume it:

| App                  | Styles                                                   | Components                                                  | Blocks pipeline                                                                         | Behavior                                |
| -------------------- | -------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------- |
| root, dump (Next.js) | `import "@raioviajante/design/styles.css"` in the layout | server components from `@raioviajante/design/components`    | dump: `remark-directive`, `remarkSoftCallouts`, `rehypeSoftBlocks` in `next.config.mjs` | `<Behavior />` once in the layout       |
| docs, lab (Astro)    | same import in the base layout                           | rendered statically through `@astrojs/react` (no hydration) | docs: same plugins in `markdown` config, replacing Starlight's Expressive Code          | `<script>` that calls `startBehavior()` |

Each app still owns its routes, content, font loading and app-specific
interactions.

### 2.3 Artwork map (old → new)

All files are in `packages/design/assets/`. Sources are in the local handoff
`art-concepts/`.

| Source                                               | New path                                    | Notes                                                |
| ---------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| `04.png`                                             | `character/avatar.png`                      | 256px; frame 04 is the centered avatar the root uses |
| `01.png` … `10.png`                                  | `search/head/frame-01.png` … `frame-10.png` | 96px; see decision D1                                |
| `01`–`10` composed                                   | `search/head/sprite.webp`, `sprite.png`     | 960×96, ten 96px frames                              |
| `04.png`                                             | `search/head/static.png`                    | 64px, reduced-motion frame                           |
| `search.png`                                         | `search/search-character.png`               | 640px, hand on chin                                  |
| `work-of-art.png`                                    | `stickers/work-of-art.png`                  | 640px                                                |
| `work-of-art-pt.png`                                 | `stickers/work-of-art-pt.png`               | Portuguese version                                   |
| `404-not-found.png`                                  | `stickers/not-found.png`                    | 640px                                                |
| `readme.png`                                         | `stickers/sitting.png`                      | sitting pose, no current use                         |
| `Artwork/Chibi Character Sticker Sheet.png`          | `stickers/sticker-sheet.png`                | source sheet                                         |
| `favicon.png`                                        | `character/head-box.png`                    | head in a box, 512px                                 |
| `Artwork/ChatGPT Image Oct 5, 2026, 01_19_29 AM.png` | `gallery/cow-muhh.webp`                     |                                                      |
| `Artwork/Moonlit Castle Chase.png`                   | `gallery/graveyard-run.webp`                |                                                      |
| `Artwork/Neon Code Lab Celebration.png`              | `gallery/laboratory.webp`                   |                                                      |
| `Artwork/Playful Calves in Motion.png`               | `gallery/calves-playing.webp`               |                                                      |
| `Artwork/Sad Man, Goofy Mirror Reflection.png`       | `gallery/mirror-donkey.webp`                |                                                      |
| `Artwork/Three Playful Cats on Purple.png`           | `gallery/black-cats.webp`                   |                                                      |
| `Artwork/Tired Patient and Binary Monitor.png`       | `gallery/hospital-bed.webp`                 |                                                      |
| `Artwork/Ukulele Sunset Beneath the Tree.png`        | `gallery/sunset-guitar.webp`                |                                                      |
| `Artwork/Melancholic Purple Portrait.png`            | `gallery/purple-portrait.webp`              |                                                      |

Gallery images are WebP at 1600px wide at most, quality 82. Frames, stickers
and character images are palette PNGs. A test fails if two files in `assets/`
are byte-identical.

### 2.4 Test plan

| Layer              | How                                                                                                                                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Package unit tests | `pnpm --filter @raioviajante/design test` (Vitest): sound map and preference, fence meta, highlighting, the whole markdown pipeline against the markup contract, component output (shell order, footer, 404, legal, lab), a check that every class a component renders is defined in the CSS, and the no-duplicate-asset check |
| Package checks     | `format:check`, `typecheck`                                                                                                                                                                                                                                                                                                    |
| Integration        | root and lab each built with a throwaway page that rendered the shell, a highlighted block, the 404 template and the behavior script (see Status); both emitted the artwork once and only what they use                                                                                                                        |
| Existing apps      | `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate` after every package change                                                                                                                                                                                                                                  |
| Per page (Phase 6) | Playwright screenshots at 1440 and 390 against the reference HTML, axe on every page, keyboard pass (⌘K, `/`, arrows, Enter, Esc, tabs, copy, lab experiments)                                                                                                                                                                 |

### 2.5 Decisions and deviations

- **D1. Frames 01–10 are avatar frames, not search-icon frames.** The ten
  files in `art-concepts/` (01–10) are the round avatar animation (blank
  circle, the avatar, the avatar with a cat, and so on). They match the
  frames the root already ships in `apps/root/public/art/avatar/`. The brief
  calls them the "search-icon animation frames", so I followed the brief's paths
  (`search/head/frame-NN.png`, `sprite`, `static`) and built the sprite from
  them. The search head the handoff draws (`assets/search-icon.png`, a crop of
  the hand-on-chin pose) has no original animation frames. Confirm that the
  search head should play the avatar animation; if it should be the
  hand-on-chin crop, a new set of frames is needed. The root's own avatar
  frames (432px WebP in `apps/root/public/art/avatar/`) are a duplicate of these
  files at a larger size: in Phase 4, serve the root avatar from the package
  (add `character/avatar-frames/` at 432px, or reuse the 256px set) and delete
  the root copy.
- **D2. One React implementation for all four sites.** Section 0 requires
  shared components built once, and three of the four apps could not share
  Astro components with the two Next.js apps. The shared components are React
  and Astro renders them statically with `@astrojs/react` (checked with a
  throwaway lab build). This adds `@astrojs/react`, `react` and `react-dom` to
  docs and lab, and conflicts with the sentence "No React, Vue, Svelte, or other
  UI framework unless a specific experiment needs…" in `apps/lab/AGENTS.md`.
  Update that sentence when lab adopts the package (Phase 4). Interactivity is
  not React state: it comes from the shared `behavior` script and `data-*`
  attributes.
- **D3. `raioviajante-design/` was not git-ignored.** The brief says it is; it
  showed as untracked. I added it to `.git/info/exclude` (local only, not
  committed). It is still not in `.gitignore`.
- **D4. `--bg` is `#191919`, not `#1b1b1b`.** The design marks `--bg` and `--font`
  as `[CHECK]`. The root's `--rv-editorial-bg` is `#191919`; the font is Noto Sans
  Mono with `ui-monospace` fallbacks, which the new `--font` keeps. Other
  values differ between the root and the handoff (`--fg` `#edf1f6` vs
  `#ececec`, muted `#8792a1` vs `#9aa0a8`, body size) but are not marked
  `[CHECK]`, so I kept the handoff's values. Compare the root at 1440px in
  Phase 4 and decide.
- **D5. The warning callout has no icon.** `docs/sweep.html` draws a triangle
  icon. The system says status is a word and to use no icons where a word
  works, so the label "Warning" and the 1px outline carry it.
- **D6. The work-of-art sticker is not duplicated in the gallery.** The brief
  lists `work-of-art` among gallery names and as `stickers/work-of-art.png`.
  Root's current gallery shows it. The same artwork is stored once, as the
  sticker; the root gallery should import it from `art.workOfArt`.
- **D7. Callout markup.** `Note` has no modifier class (`callout`);
  the other kinds use `callout--<kind>`. `warning` and `careful` share the 1px
  outline; `deprecated` is dotted.
- **D8. Sound.** Kinds: `nav` (hover and click, the root's original pair),
  `hover`, `click`, `open`, `tick`, `copy`, `toggle`, `success`, `reject`, plus
  the original `flip`, `gallery`, `gallery-reveal`, `typing`. The new voices are
  new synthesized sounds (the root only had hover, click, flip, gallery and
  typing); listen to them and adjust in `sound/synth.ts`. Hover sounds are
  limited to one per 80ms and ticks to one per 45ms. With reduced motion, hover
  and typing sounds are skipped. The old `editorial-sound.ts` entry is a shim
  over the new module so root and dump keep working until they move.
- **D9. CSS class collisions.** `editorial.css` and the new `base.css` both
  define `.rv-leader`, `.rv-footer`, `.rv-sound` and others. An app must switch
  from `editorial.css` to `styles.css` in one commit, not load both.
- **D10. Vercel Ignored Build Step.** `AGENTS.md` says root's and lab's steps
  list `../../packages/design` and dump's and docs' do not. `docs/deployment.md`
  says root, dump and lab list it. dump already imports the package, so check
  the real setting before deploying. docs must be updated by the owner before
  docs imports the package. Neither was changed here.
- **D11. Search head peek and bubble styles** (`.rv-peek`, the "?" bubble, the
  hop animation) were not copied into `base.css`; Phase 3 owns them and replaces
  the hop with the sprite animation. `.rv-search` and the search page classes
  are in `base.css` as a starting point.

### 2.6 Placeholders and open checks found in the handoff

Counts across the handoff pages and notes. Keep every one in the migrated
pages; do not fill them.

| Placeholder                                                                                                  |    Count | Where                                                                   |
| ------------------------------------------------------------------------------------------------------------ | -------: | ----------------------------------------------------------------------- |
| `[DATE]`                                                                                                     |       31 | legal pages "last updated", changelogs, posts                           |
| `[CONFIRM]`                                                                                                  |       29 | legal pages (license, quoting, artwork reuse, retention, governing law) |
| `[VERSION]`                                                                                                  |       20 | docs reference and guides                                               |
| `[COMMIT]`                                                                                                   |        7 | docs, lab                                                               |
| `[REQUESTED-PATH]`                                                                                           |        7 | 404 pages (now filled at runtime by `behavior`)                         |
| `[RETENTION]`, `[NONE OR TOOL]`, `[HOSTING PROVIDER]`                                                        |   6 each | privacy pages                                                           |
| `[LICENSE OR ALL RIGHTS RESERVED]`, `[LICENSE FOR SNIPPETS]`                                                 |   6 each | terms pages                                                             |
| `[CHANGE]`                                                                                                   |        6 | docs changelog                                                          |
| `[NOTE FROM LEARNING NOTES]`                                                                                 |        5 | lab 003 boot sector                                                     |
| `[SOURCE]`, `[REVISION]`, `[FOOTNOTE TEXT]`                                                                  |   3 each | dump blocks, lab 003                                                    |
| `[PREVIOUS]`, `[MEANING]`, `[FIDELITY]`, `[CONFIRM PER EXPERIMENT]`, `[CODE]`, `[INSTALL COMMAND FOR MACOS]` | 1–2 each | docs, lab                                                               |

Open checks from DESIGN-SYSTEM.md section 7:

- `[CHECK]` `--bg`, `--font`: resolved (D4).
- Cookie `[CHECK]`: implemented (cookie on `.raioviajante.com`, legacy localStorage migrated).
- Orbit rules in 002 (start from QUEUED; succeed and fail from RUNNING; cancel from QUEUED or RUNNING): verify against the Orbit source in Phase 4 and report differences.
- Boot sector sections 2–5 are reconstructed: replace with revision e966889.
- Series on dump (jobs-mcp, orbit, sweep) and reading times are illustrative: compute real ones.
- Legal pages are a template, not legal advice.
- The search line for the root ("what are you looking for?") needs confirmation.

---

## 3. Status

Branch `feat/design-migration`. Nothing is pushed.

| Phase                  | State       | Notes                                                                                       |
| ---------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| 0. Audit and plan      | done        | this file                                                                                   |
| 1. Shared home         | done        | styles, assets, sound                                                                       |
| 2. Shared components   | done        | components, blocks, sound, behavior, templates; no app consumes them yet                    |
| 3. Search              | not started | search menu item, shortcuts, search page, index                                             |
| 4. Migrate each site   | not started |                                                                                             |
| 5. Features to finish  | partly      | `AGENTS.md` / `CLAUDE.md` rules are written; SEO, accessibility and performance work remain |
| 6. Verify and clean up | not started |                                                                                             |

### Phase 1 (done)

- `packages/design/styles/tokens.css`, `base.css`, `blocks.css`, `index.css`
- `packages/design/assets/` (see 2.3): 9 gallery images, 5 sticker files, 2 character files, `search/search-character.png`, `search/head/` (10 frames, sprite in WebP and PNG, static frame)
- `packages/design/sound/`: `events.ts`, `synth.ts`, `preference.ts`, `player.ts`, `init.ts`, `index.ts`
- `packages/design/editorial-sound.ts`: now a shim over `sound/`
- Docs copied into the repo: `docs/design-system.md`, `docs/blocks.md`

### Phase 2 (done)

- Shell: `components/Shell.tsx` (`Shell`, `NavGroup`, `SoundToggle`, `Footer`)
- Page parts: `components/page.tsx` (`IndexHeader`, `PageHeader`, `Section`, `SectionHeading`, `LeaderRow`, `Pager`, `RelatedRows`, `Prose`)
- Soft blocks: `blocks/` (Shiki theme `theme.ts`, `highlight.ts`, `meta.ts`, `model.ts`, markup `build.ts`, `rehype.ts` with `remarkSoftCallouts` and `rehypeSoftBlocks`, `client.ts`) and `components/blocks.tsx` (`highlightBlock`, `CodeBlock`, `Callout`, `TableBlock`, `Figure`, `Footnotes`, `PullQuote`)
- Sound: `sound/` with the full sound map in `events.ts`, `data-sound` delegation, `playSound(kind)`, shared preference
- Lab: `components/lab.tsx` (`LabBench`, `BenchBand`, `StateMark`, `ActionButton`, `ToggleButton`)
- Templates: `components/templates.tsx` (`LegalPage`, `NotFoundPage`)
- Client script: `behavior.ts`, `behavior-react.tsx`
- Artwork access: `components/art.tsx` (`Art`, `art`), `components/gallery.ts`
- Tests: `packages/design/tests/` (35 tests)
- Rules: `AGENTS.md` and `CLAUDE.md`, section "Design system migration"

Not wired in this session: the blocks plugins are not yet in dump's or docs'
pipeline (that happens with the app migration in Phase 4); the markup, the
plugins and the Next.js and Astro rendering are covered by the package tests and
the two throwaway builds.

### Checks run

- `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate`: format, lint, typecheck, test and build pass for every app and for `packages/design`.
- Throwaway pages (not committed): a root page and a lab page rendered `Shell`, `IndexHeader`, `CodeBlock`, `Callout`, `NotFoundPage` and the behavior script; both builds passed and emitted only the artwork they use.
- Not run: browser checks (Playwright screenshots, axe, keyboard), because no page uses the system yet. The sound voices have not been listened to.

---

## 4. Next session

The brief asks for Phase 4 next. Phase 4 needs the search item and page from
Phase 3, which was not started. Do the per-app work below first; each step that
needs search is marked **(search)** and waits for Phase 3 (or do Phase 3 first).

### Before you start

1. `git checkout feat/design-migration`; `git log --oneline -12`; `pnpm install`.
2. Read `AGENTS.md` (section "Design system migration"), `docs/design-system.md`, `docs/blocks.md`, `packages/design/README.md`, and section 2.5 above.
3. Open the reference pages in `raioviajante-design/` in a browser (local only).
4. Run `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate` to confirm a clean start.
5. Ask the owner, before touching docs, to add `../../packages/design` to the docs project's Ignored Build Step (D10). Do not change Vercel settings yourself.
6. Stage files explicitly. One app per commit series; validate the app before each commit.

### Phase 4a: root (`apps/root`, Next.js)

1. Replace `@raioviajante/design/editorial.css` with `@raioviajante/design/styles.css` in `app/layout.tsx` (D9: one commit, no mixed loading). Keep `next/font` for Noto Sans Mono and bind its variable to `--font` if the stack must match.
2. Render `<Behavior />` in the layout. Delete `components/SoundToggle.tsx`, `SiteFooter.tsx`, `SectionHeading.tsx`, `LeaderRow.tsx` and `SiteNavigation.tsx` once the pages use `Shell`, `Footer`, `Section`/`SectionHeading` and `LeaderRow`. Keep `GalleryBoard`, `AvatarCoin` and the `*PreviewRow` components if they stay app-specific; move the avatar frames to the package (D1) and the gallery images to `@raioviajante/design/gallery`, then delete `public/art/`.
3. Rebuild each page on `Shell` with `site="root"` (about, contact, gallery, privacy, projects, setup, terms, this-site, home). Keep all existing content and text. Home uses `IndexHeader`.
4. Terms and Privacy: move the existing legal text into `LegalPage` sections without changing the wording.
5. Add `app/not-found.tsx` with `NotFoundPage` (`site="root"`; line "this page moved, never existed, or I haven't built it yet."; try-instead rows from `raioviajante-design/404.html`).
6. **(search)** Add the search item and `/search` page.
7. Compare each page with the reference at 1440px and 390px. Resolve D4 (compare the root before and after) and note any differences.
8. Validate: `pnpm --filter @raioviajante/root format:check lint typecheck build`.

### Phase 4b: dump (`apps/dump`, Next.js, MDX)

1. In `next.config.mjs`, replace `rehype-pretty-code` and the inline `shikiTheme` with `remark-directive`, `remarkSoftCallouts` and `rehypeSoftBlocks` from `@raioviajante/design/blocks`. Next's MDX loader needs plugin names as strings or resolvable modules: if the package TypeScript entry cannot be loaded that way, export a small JavaScript wrapper from the package. Keep `remark-frontmatter` and `remark-gfm`, and keep `rehype-slug`.
2. Switch the layout to `styles.css` and `<Behavior />`; build every page on `Shell` with `site="dump"`. Delete `SiteHeader`, `SiteFooter`, `SoundToggle`, `PrimaryNavigation`, `CodeCopy` and the app's copy of code styles when the shared ones replace them. Keep `PostSearch` until the shared search page replaces it.
3. Pages: posts index (latest featured, by month, series, follow along), archive and tags (leader lists; tags split recurring/once), post (sidebar TOC from headings, reading progress, numbered sections, computed reading time, metadata leaders, `Pager`, related by tag with `RelatedRows`, "try it in the lab", giscus with a theme built from the tokens in `public/giscus.css`), terms, privacy, `app/not-found.tsx`.
4. Remove `app/about` and `app/uses` and add permanent redirects from `/about` and `/uses` to `https://raioviajante.com/about` and the matching root page (`redirects()` in `next.config.mjs`). Update `tests/about-page.test.tsx` and `tests/uses-page.test.tsx` (delete them with the pages) and the sitemap.
5. Series and reading time: compute reading time from the MDX; do not copy the handoff's illustrative series. Add only series that exist in `content/posts`.
6. **(search)** Search page and index.
7. Tests: update Jest tests that assert the old markup; add tests for the new pages. Keep the RSS, sitemap, robots and OG tests passing.
8. Validate: `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm --filter @raioviajante/dump format:check lint typecheck test build`.

### Phase 4c: docs (`apps/docs`, Astro + Starlight)

1. After the owner updates the Ignored Build Step: add `@raioviajante/design` (`workspace:*`), `@astrojs/react`, `react`, `react-dom`, and `@types/react` and `@types/react-dom`. Add `integrations: [react()]` in `astro.config.mjs`. Check `pnpm-workspace.yaml` `allowBuilds` if the install asks for it.
2. Decide how much of Starlight stays. The design needs left tree nav, content, "on this page", breadcrumb label, status word, last updated and "edit on GitHub". Keep Starlight for content collections and routing, and override `PageFrame`/`Sidebar`/`TableOfContents`/`Footer` and the page title with shared components, or drop Starlight for a plain Astro content collection. Record the choice in `apps/docs/docs/`.
3. Replace Starlight's Expressive Code with the shared pipeline (`expressiveCode: false`, then `markdown.remarkPlugins`: `remark-directive`, `remarkSoftCallouts`; `markdown.rehypePlugins`: `rehypeSoftBlocks`; `markdown.syntaxHighlight: false`).
4. Remove the Google Fonts links (IBM Plex Mono, Source Serif), the theme switcher overrides and `src/styles/theme.css`; load Noto Sans Mono self-hosted or preloaded.
5. Pages: home (dotted search row, projects with status, standards, "reading these docs"), guide and reference layouts (`raioviajante-design/docs/sweep.html`, `sweep-cli.html`), the rewritten design language page (`docs/components.html`, `design-language.html`; rewrite `src/content/docs/raioviajante/design-language.md` for the new system), terms, privacy, `404.astro`.
6. Keep `[VERSION]`, `[DATE]`, `[COMMIT]` and other placeholders in the new pages; the existing content in `projects/sweep` and `repository-conventions` stays factual.
7. **(search)** Search page and index; section numbers in results.
8. Validate: `pnpm --filter @raioviajante/docs typecheck build` (docs has no lint, format or test scripts: do not invent them).

### Phase 4d: lab (`apps/lab`, Astro)

1. Add `@astrojs/react`, `react`, `react-dom` and types; `integrations: [react()]`. Update the "No React" sentence in `apps/lab/AGENTS.md` (D2) and `apps/lab/docs/design.md`.
2. Replace `src/layouts`, `Header.astro`, `Footer.astro` and `src/styles/global.css` with the shared `Shell`, `styles.css` and the `behavior` script. Switch off the old `@raioviajante/design/tokens.css` import.
3. Pages: experiments index (filter all/active/done, fidelity explained, notebook), the three experiments with `LabBench`, `BenchBand`, `StateMark`, `ActionButton`, terms, privacy, `404.astro`.
4. Experiments use the existing logic modules (`src/lib/filename-classifier.ts`, `src/lib/execution-states.ts`) and the handoff logic in `source/lab/*.dc.html` (`class Component`, `renderVals()`):
   - 001 filename classifier: suffix mirrors Python `Path.suffix` (last dot, ignored at index 0 and at the end, lowercased); categories are those on the docs Sweep page. Compare with `src/lib/filename-classifier.ts` and report differences.
   - 002 execution states: actions start/succeed/fail/cancel; rejected actions log `rejected: <action> from <STATE>` and change nothing; times from the browser clock; "new example" resets. Verify the rules against the Orbit source (assumed: start from QUEUED; succeed and fail from RUNNING; cancel from QUEUED or RUNNING) and report differences.
   - 003 boot sector: five sections, source and note each, previous/next, progress `n / 5`. Replace the reconstructed code and notes with revision `e966889`; keep `[NOTE FROM LEARNING NOTES]` where there is no real note.
   - Accepted actions call `playSound("success")`, rejected ones `playSound("reject")`; results live in an `aria-live` region.
5. **(search)** Search page and index (001–003).
6. Validate: `pnpm --filter @raioviajante/lab format:check lint typecheck build`.

### Phase 4e: cross-cutting

- Each app's host 404: Next.js `not-found.tsx` (root, dump); Astro `src/pages/404.astro` (docs, lab). Confirm each builds a `404.html` / not-found response that Vercel serves.
- Update `docs/architecture.md` and each app's `docs/design.md` so they describe what is implemented, not what is planned.
- Update `docs/deployment.md` only to match what the owner confirms about the Ignored Build Steps.

### Report back

List every `[CONFIRM]`, `[DATE]`, `[VERSION]`, `[COMMIT]` and similar placeholder left in the apps, every difference from the reference pages and why, and the open questions: D1 (what the search head animates), D4 (root colors), the root search line, and whether the new sound voices are acceptable.
