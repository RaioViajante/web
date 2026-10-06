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
    search/not-found.png
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
  - Empty state shows `art-concepts/not-found.png` (exported once as `search/not-found.png`) with "maybe I haven't built it yet." and suggestion chips.
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
    search/      search-character.png, head/static.png
    character/avatar-frames/ frame-01…10.png
    gallery/     nine .webp files
  sound/         events.ts (the sound map), synth.ts, preference.ts, player.ts, init.ts, index.ts
  blocks/        theme.ts, highlight.ts, meta.ts, model.ts, build.ts, rehype.ts, client.ts, index.ts
  components/    Shell.tsx, page.tsx, blocks.tsx, lab.tsx, templates.tsx, art.tsx, gallery.ts, sites.ts, search.tsx, index.ts
  search/        client.ts
  behavior.ts, behavior-react.tsx, search-react.tsx
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

| Source                                               | New path                                                | Notes                                                |
| ---------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------- |
| `04.png`                                             | `character/avatar.png`                                  | 256px; frame 04 is the centered avatar the root uses |
| `01.png` … `10.png`                                  | `character/avatar-frames/frame-01.png` … `frame-10.png` | 96px; reserved for root avatar                       |
| crop of `search.png`                                 | `search/head/static.png`                                | 64px hand-on-chin search head                        |
| `search.png`                                         | `search/search-character.png`                           | 640px, hand on chin                                  |
| `work-of-art.png`                                    | `stickers/work-of-art.png`                              | 640px                                                |
| `work-of-art-pt.png`                                 | `stickers/work-of-art-pt.png`                           | Portuguese version                                   |
| `404-not-found.png`                                  | `stickers/not-found.png`                                | 640px                                                |
| `readme.png`                                         | `stickers/sitting.png`                                  | sitting pose, no current use                         |
| `Artwork/Chibi Character Sticker Sheet.png`          | `stickers/sticker-sheet.png`                            | source sheet                                         |
| `favicon.png`                                        | `character/head-box.png`                                | head in a box, 512px                                 |
| `Artwork/ChatGPT Image Oct 5, 2026, 01_19_29 AM.png` | `gallery/cow-muhh.webp`                                 |                                                      |
| `Artwork/Moonlit Castle Chase.png`                   | `gallery/graveyard-run.webp`                            |                                                      |
| `Artwork/Neon Code Lab Celebration.png`              | `gallery/laboratory.webp`                               |                                                      |
| `Artwork/Playful Calves in Motion.png`               | `gallery/calves-playing.webp`                           |                                                      |
| `Artwork/Sad Man, Goofy Mirror Reflection.png`       | `gallery/mirror-donkey.webp`                            |                                                      |
| `Artwork/Three Playful Cats on Purple.png`           | `gallery/black-cats.webp`                               |                                                      |
| `Artwork/Tired Patient and Binary Monitor.png`       | `gallery/hospital-bed.webp`                             |                                                      |
| `Artwork/Ukulele Sunset Beneath the Tree.png`        | `gallery/sunset-guitar.webp`                            |                                                      |
| `Artwork/Melancholic Purple Portrait.png`            | `gallery/purple-portrait.webp`                          |                                                      |

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

- **D1. Resolved: frames 01–10 are avatar frames, not search-icon frames.** The ten
  files in `art-concepts/` (01–10) are the round avatar animation (blank
  circle, the avatar, the avatar with a cat, and so on). They match the
  frames the root already ships in `apps/root/public/art/avatar/`. The brief
  calls them the "search-icon animation frames". Phase 3 moved them to
  `character/avatar-frames/`, cropped the hand-on-chin head from the original
  search character into `search/head/static.png`, and removed the unused
  search sprites. The menu head hops in CSS. The root's own avatar
  frames (432px WebP in `apps/root/public/art/avatar/`) are a duplicate of these
  files at a larger size: in Phase 4, serve the root avatar from the package
  (add `character/avatar-frames/` at 432px, or reuse the 256px set) and delete
  the root copy.
- **D2. One React implementation for all four sites.** Section 0 requires
  shared components built once, and three of the four apps could not share
  Astro components with the two Next.js apps. The shared components are React
  and Astro renders them statically with `@astrojs/react` (checked with a
  throwaway lab build). This adds `@astrojs/react`, `react` and `react-dom` to
  docs and lab. `apps/lab/AGENTS.md` now permits shared React rendered
  statically, with no hydration. Interactivity is
  not React state: it comes from the shared `behavior` script and `data-*`
  attributes.
- **D3. `raioviajante-design/` was not git-ignored.** The brief says it is; it
  showed as untracked. I added it to `.git/info/exclude` (local only, not
  committed). It is still not in `.gitignore`.
- **D4. Root tokens are the source of truth.** Phase 3 aligned `--bg`, `--fg`,
  `--fg-2`, `--line`, `--font`, body size, weight, and line height with the
  root's current editorial CSS. Compare the root at 1440px in Phase 4 after
  the shell migration and record any remaining visual differences.
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
- **D10. Vercel Ignored Build Step.** Phase 3 makes docs a design-package
  consumer. The owner must apply the `docs/deployment.md` command to dump and
  docs in Vercel before deployment. Root's and lab's settings already watch
  `../../packages/design`. No Vercel setting was changed in this session.
- **D11. Search head peek and bubble styles** live in
  `packages/design/styles/search.css`. The hand-on-chin head hops once; its
  "?" bubble appears after 150ms. Reduced motion shows the static head and
  bubble without the hop.

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
- The root search line is "what are you looking for?" (owner decision, Phase 3).

---

## 3. Status

Branch `feat/design-migration`. Nothing is pushed.

| Phase                  | State       | Notes                                                                                       |
| ---------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| 0. Audit and plan      | done        | this file                                                                                   |
| 1. Shared home         | done        | styles, assets, sound                                                                       |
| 2. Shared components   | done        | components, blocks, sound, behavior, templates; no app consumes them yet                    |
| 3. Search              | done        | shared menu/page/behavior, four static indexes and routes; pending Vercel settings          |
| 4. Migrate each site   | partly      | root (4a), dump (4b) and docs (4c) done; lab not started                                    |
| 5. Features to finish  | partly      | `AGENTS.md` / `CLAUDE.md` rules are written; SEO, accessibility and performance work remain |
| 6. Verify and clean up | not started |                                                                                             |

### Phase 1 (done)

- `packages/design/styles/tokens.css`, `base.css`, `blocks.css`, `index.css`
- `packages/design/assets/` (see 2.3): 9 gallery images, 5 sticker files, 2 character files, `search/search-character.png`, `search/head/static.png`, `character/avatar-frames/` (10 frames)
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

### Phase 3 (done)

- Shared `SearchNavItem` and `SearchPage` in `packages/design/components/search.tsx`;
  shared CSS in `styles/search.css`; shared browser behavior in
  `search/client.ts` (shortcuts, live search, scope toggle, grouped results,
  keyboard selection, and empty state).
- `/search` and build-time `/search-index.json` on root, dump, docs, and lab.
  Each endpoint exposes CORS headers for the client-side "everywhere" merge.
  Dump indexes published post bodies; docs indexes pages and headings; lab
  indexes experiments; root indexes pages and projects.
- The root, dump, docs, and lab shells have the search menu item and shortcuts.
  The rest of each app remains on its existing shell for Phase 4.
- The hand-on-chin head is cropped from the original search character; the
  unused search sprite is removed. Avatar frames are retained under
  `character/avatar-frames/` for Phase 4.
- `apps/lab/AGENTS.md` now permits static shared React rendering. The design
  tokens and `docs/design-system.md` use the root's current background,
  foreground, muted, rule, body size, weight, and leading.
- `docs/deployment.md` documents the required dump and docs Vercel Ignored
  Build Step setting. The owner still needs to apply it in Vercel.

### Phase 4a: root (done)

- `apps/root` now uses `@raioviajante/design/styles.css` and `<Behavior />`
  (which also runs search). Every page renders `components/RootShell.tsx`
  (the shared `Shell`, root's pages, the search item). Pages use `IndexHeader`,
  `PageHeader`, `Section`, `LeaderRow`, `Quote` (contact), `LegalPage`
  (terms, privacy) and `NotFoundPage` (`app/not-found.tsx`, the host 404).
- Removed from root: `SiteNavigation`, `SiteHeader`, `SiteFooter`,
  `SoundToggle`, `LeaderRow`, `SectionHeading` and all of `public/art`.
  The avatar frames, gallery images and the "work of art" sticker come from the
  package. `AvatarCoin`, `PreviewRow`, `ProjectPreviewRow`, `GalleryBoard` and
  the projects list stay in the app (root-only); `globals.css` holds only those.
- Package additions: avatar frames re-exported at 224px (`./avatar`,
  `components/avatar.ts`; they were 96px), an `avatar` slot in `IndexHeader`, a
  `describedBy` prop on `LeaderRow`, `.rv-dash-list`, nowrap leader values
  (long strings wrap), and a narrow `./art` export for client components.
- Search: the index endpoints already worked in dev for all four sites (checked
  in a browser with Playwright; I could not reproduce an empty dev search).
  "Everywhere" now keeps this site's results and shows a quiet note when
  another site's index is unreachable (`search/engine.ts`, tested).
- Empty-search artwork: `art-concepts/empty-search.png` does not exist in the
  handoff, so nothing was copied. The empty state still uses
  `search/not-found.png`. When the file arrives, export it as
  `stickers/empty-search.png`, switch `searchNotFound` in `components/art.tsx`
  and update `docs/design-system.md`.
- Differences from the old root look (all follow the shared rules or tokens):
  the hover description and gallery tiles lost their box-shadows and
  brightness filter; the description card uses `--block`; the sound toggle and sidebar sit in the
  shared positions (on 390px the sidebar is above the toggle, as in the
  reference); rows are taller (shared leader spacing); navigation is full page
  loads, not client transitions.
- Legal pages: text unchanged. Added the template's "In short" rows from the
  existing text; `[LICENSE OR ALL RIGHTS RESERVED]` and `none [CONFIRM]` are the
  handoff placeholders. The existing date "October 4, 2026" is kept. Section
  numbers are now 00-05 (they were 06.x and 07.x). Open for the owner: the
  Privacy Policy says the sound preference is stored "in this browser"; it is
  now a cookie on `.raioviajante.com`. Wording left as is.

### Root regression pass and follow-ups (done)

The root was the reference, so it was compared with the pre-migration commit
(`175672c`, run from a worktree) by computed styles and full-page screenshots
at 1440px and 390px, plus hover states. Values restored in
`packages/design/styles/tokens.css` and `base.css`:

- Colors: `--fg-3` `#858b94` to `#8792a1`; `--dots` `#444444` to
  `rgba(215, 223, 234, 0.3)`; new `--accent` `#b9a1d2` (selection and focus ring
  only), `--hover-link`, `--hover-label`, `--hover-note`, `--hover-inline`,
  `--inline-link`, `--press-bg`, `--press-shadow`, `--card`, `--art-shadow`,
  `--art-shadow-hover`.
- Type: index and page title 56/48 px, weight 700 to
  `clamp(35.2px, 4.4vw, 45.76px)`, weight 650, line height 1.28; section 18 to
  17.952 px, weight 650; section number 16.5/500, column 52.8px; caps label 12
  to 13.728 px, tracking 0.12em to 0.08em; sidebar item 16.5 to 15.84 px;
  leader value 14 to 16.5 px; footer 12.5 to 12.32 px, line height 1.9; sound
  toggle 12.5 to 14.08 px; smoothing `antialiased`, `optimizeLegibility`.
- Layout: content column 740 to 739.2px, sidebar 230 to 228.8px, gutter 48 to
  61.6px, shell width `min(100% - 35.2px, 1320px)`, section gap 56/80 to
  42.24px (padding-top 22px), leader gap 13.2px and margin 9.68px, avatar 112 to
  114.4px, dash list indent 20.24px and spacing 7.92px, paragraph margin
  17.6px. Sections and the column are block flow again so margins collapse as
  before; the footer margin is 112.64px on desktop (70.4px on mobile).
- Interaction: sidebar items transition color and rule in 220ms and the current
  item's rule is `--fg-2`; a linked leader row brightens its name, brightens and
  scales its value 1.8% (560ms) and presses in on `:active` (inset shadow);
  footer links transition to `--hover-link` in 420ms; selection and focus ring
  use `--accent` (2px, offset 4px); the hover description card, project and
  feed links and the gallery tiles keep their old effects. The gallery tiles
  have their shadows and brightness back (the one documented exception to "no
  shadows"); the hover card has its border and `--card` background and no
  shadow.
- Structure: the sound toggle is the first child of the shell (grid row 1,
  centered over the content column) so it stays first on small screens, as in
  the old root; the mobile PAGES list is two columns (search spans the row),
  "on this page" stays one column.
- After the pass the root pages differ from the old ones by 0.2 to 2% of
  pixels at both widths. Known differences: the contact line is the shared
  `Quote` (same as before); Terms and Privacy use the legal template
  (new "In short" section); the root footer no longer marks the current site.

Follow-ups done in the same session: shared components take a `linkComponent`
prop (used for internal paths only; `next/link` on Next apps, plain anchors on
Astro) and root navigates client-side; the sound toggle repaints and the 404
requested path fills after client-side page swaps, and the audio context
survives navigation (tests in `tests/links.test.tsx` and
`tests/navigation.test.ts`); legal rows that needed a placeholder were removed
from root, and the Privacy Policy now says the sound preference is "saved in a
small cookie on .raioviajante.com" (the "Last updated" date was not changed).

### Phase 4b: dump (done)

- `apps/dump` uses `styles.css` and `<Behavior />`; every page renders
  `components/DumpShell.tsx` (the shared `Shell`, `next/link`, search item;
  a post counts as "posts" and adds "on this page"). Pages: home
  (`IndexHeader`, latest, months, series, follow along), archive (year, month,
  date column, first tag), tags (recurring, once so far), tag, post, search,
  terms, privacy, `not-found.tsx`.
- Posts are compiled on the server by `lib/render-post.tsx` (`@mdx-js/mdx`) with
  `remark-frontmatter`, `remark-gfm`, `remark-directive`, `remarkSoftCallouts`,
  `rehype-slug`, section numbering and `rehypeSoftBlocks`. All 12 posts render
  (29 code blocks; the posts use no callouts, tables or footnotes). The MDX
  loader, `rehype-pretty-code`, `shiki`, `mdx-components.tsx` and the local
  code, callout and table styles are gone. Post content is unchanged.
- Removed: `SiteHeader`, `SiteFooter`, `SoundToggle`, `PrimaryNavigation`,
  `CodeCopy`, `PostSearch`, `PostToc`, `PostMeta`, `ReadingProgress`, About and
  Uses (with their tests). `/about` redirects permanently to
  `raioviajante.com/about` and `/uses` to `raioviajante.com/setup` (root has no
  `/uses`; Setup is its equivalent). Sitemap adds `/terms` and `/privacy`.
- Giscus: `app/giscus.css/route.ts` generates the theme from the shared
  `tokens.css` at build time; `public/giscus.css` is deleted.
- Shared additions: `scroll.ts` (reading progress `[data-reading-progress]`,
  "on this page" `.is-current`), flat prose styles in `blocks.css`, subpath
  exports `./shell`, `./parts`, `./templates`, `./link` (dump's Jest cannot load
  the ESM-only highlighter through the components index), strict-index fixes in
  `blocks/`, and an optional `lastUpdated` on `LegalPage`.
- Legal text for dump uses only facts already in the repository. Omitted
  because they needed an unconfirmed fact: the quoting and artwork reuse
  permissions, the license for snippets, the log retention period, a "last
  updated" date, and any analytics statement. The host is named as Vercel
  (from `docs/deployment.md`); the Google Fonts sentence is dropped (dump
  self-hosts its font). "All rights reserved" for articles comes from
  `apps/dump/content/README.md`.
- Differences from the reference: the post body has no line numbers unless a
  fence asks for them; each home "Series" row links to the series' first part;
  reading times are computed (220 words per minute); the giscus box only loads
  online and when scrolled near.

### Phase 4c: docs (done)

- Decision: Starlight is removed; docs is a plain Astro content collection
  (`src/content.config.ts`, glob loader) on the shared shell. Starlight could
  not give the two-column layout with "on this page" in the sidebar without
  overriding most of itself. Pagefind went with it; search is the shared
  client-side search. Recorded in `apps/docs/docs/design.md` and
  `apps/docs/AGENTS.md`.
- Markdown pipeline (`astro.config.mjs`, `unified()` from
  `@astrojs/markdown-remark`, which Astro 7 no longer installs by default):
  `remark-directive`, `remarkSoftCallouts`, `rehypeNumberSections`,
  `rehypeSteps`, `rehypeSoftBlocks`; Astro's own highlighter is off.
- Layout: `src/layouts/DocsShell.astro` plus `DocsFrame.tsx` (the shared shell
  rendered statically). `.astro` files cannot pass JSX in props to React, so
  anything with JSX props (shell, page header, legal pages) is a small React
  component in `src/components/`. Fonts: `@fontsource-variable/noto-sans-mono`.
  Removed: the purple accent, IBM Plex, Source Serif, the theme toggle, Google
  Fonts and every Starlight override.
- Pages: home (`IndexHeader` with the animated `AvatarCoin` (the search lives only in the sidebar item, by the owner's choice), `01. projects/` and
  `02. raioviajante/` with status words), guide and reference layout
  (`[...slug].astro`: breadcrumb label, status and meta row, numbered sections,
  steps, tables, callouts, last updated, edit on GitHub, prev/next), search,
  Terms, Privacy, 404 (`/404.html`).
- Content: the three pages keep their text. Additions that only restructure:
  `## Overview` above Sweep's intro, three sentences wrapped as callouts
  (`:::note`, `:::important`, `:::warning`), a `## Try it and read more` list
  of real links (the filename classifier in lab, two dump posts, the source),
  and frontmatter. New: `projects/sweep/cli.md` (the reference layout), written
  only from facts already in the Sweep guide. The design-language page is
  rewritten for the current system (tokens, root values, no purple accent, no
  serif, footer with no current site). The home page adds hum, orbit and
  yanawa as in the reference (orbit and yanawa link to their dump posts).
- Last updated: the date of the last git commit that touched the page, read at
  build time and omitted on a shallow clone or without git; never invented. No
  version or commit hash is shown.
- Left out because the repository does not say: the version, the changelog and
  exit codes of the Sweep CLI, the "guide (draft)" line for hum, a Terms
  license for text and artwork, any retention period, and a legal "last
  updated" date. The tabs of the reference (preview and run) are not used: the
  guide's text keeps "Preview" and "Run" as separate subsections, so the
  platform tabs are only covered by the shared behavior and its tests, not by a
  docs page.
- Footer: no site is marked as current on any site (`aria-current` removed from
  `Footer`, `docs/design-system.md` updated).
- Contact quote on root: already done in `d8ea6de`.

### Checks run

- Phase 2: `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate`
  passed for every app and `packages/design` before Phase 3.
- Phase 3: `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate`
  passed after the search changes: package and app format, lint, typecheck,
  35 package tests, 122 dump tests, and production builds for all four apps.
  The builds emitted `/search` and `/search-index.json` for all four apps.
- Phase 3 browser smoke test: Firefox on local servers confirmed results on
  root, dump, docs, and lab; the "everywhere" scope merged all four indexes
  and kept result links local; ArrowDown and Enter opened the selected dump
  result; ⌘K, Ctrl+K, and `/` opened search; `/` stayed in the query while
  typing; Esc cleared it; and the empty state showed the sticker and chips.
  This test found and fixed local index lookup and Astro trailing-slash routes.
- Throwaway pages (not committed): a root page and a lab page rendered `Shell`, `IndexHeader`, `CodeBlock`, `Callout`, `NotFoundPage` and the behavior script; both builds passed and emitted only the artwork they use.
- Phase 4c: `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate` passed (50 package tests, 102 dump tests, four builds). Playwright checked every docs page at 1440px and 390px: no overflow, the three callouts, steps, copy buttons, the "on this page" tracking, sound, `/` to search, search "this site" and "everywhere", and the 404 path. axe was not run.
- Phase 4b and the root regression pass: `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate` passed (format, lint, typecheck, 49 package tests, 102 dump tests, four builds; dump prerendered 69 pages). Playwright checked every dump page at 1440px and 390px: no overflow, scroll tracking, 29 copy buttons, sound toggle, ⌘K, search and the 404 path. axe was not run.
- Phase 4a: `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate`
  passed (format, lint, typecheck, 43 package tests, 122 dump tests, four
  builds). Playwright (Chromium) screenshots of every root page at 1440px and
  390px before and after, no horizontal overflow on any page, the gallery
  reveal, the sound toggle (cookie `rv-sound`, kept across reload), `/` to open
  search and a search for a known page, and the 404 requested path all behaved.
  axe was not run.
- Not run in Phase 3: browser screenshots and axe. The sound voices have not
  been listened to. Phase 6 owns the full visual and accessibility pass.

---

## 4. Next session

Phases 4a (root), 4b (dump) and 4c (docs) are complete. Do **Phase 4d: lab**
only. Do not start Phase 5 or 6.

### Before you start

1. Work on `feat/design-migration`. `git status` and `git log --oneline -15`.
   Preserve uncommitted work (the owner's edits to
   `packages/design/{.prettierignore,package.json,tsconfig.json}` and
   `packages/design/playground/`: stage only your own hunks with
   `git diff -U3 <file>`, keep your hunk, `git apply --cached`). Use
   `git add <paths>` only after `git restore --staged` on anything unrelated,
   because earlier `git rm` calls end up in the next commit.
2. Read `AGENTS.md`, `docs/design-system.md`, `docs/blocks.md`,
   `apps/docs/docs/design.md` (the closest example: Astro, shared React
   rendered statically) and `apps/lab/AGENTS.md`.
3. Lab is Astro. Its index header uses the animated `AvatarCoin` like root, dump and docs (`@raioviajante/design/avatar-coin`). Follow the docs pattern: a layout that renders a React
   `*Frame.tsx` around the shared `Shell` (`.astro` files cannot pass JSX in
   props), `styles.css`, a `<script>` calling `startBehavior()`, the font from
   `@fontsource-variable/noto-sans-mono` (family `"Noto Sans Mono Variable"`),
   `trailingSlash` is `always` (so pass `href="/search/"` to the search item).
   Drop `@raioviajante/design/tokens.css` and every local color, the
   IBM Plex / Source Serif fonts and the old header, footer and `global.css`.
4. Compare with `raioviajante-design/lab/` (index, three experiments, search,
   terms, privacy, 404) at 1440px and 390px with Playwright installed outside
   the repo; the old lab can be run from `git worktree add <dir> <commit>` with
   `cp -Rc node_modules` (see how the root was compared).
5. Pages: experiments index (filter all/active/done, fidelity explained,
   notebook), the three experiments with `LabBench`, `BenchBand`, `StateMark`,
   `ActionButton`, search, terms, privacy, 404, as in the Phase 4d list below.
   Experiments keep 001–003 and `aria-live` results; accepted actions call
   `playSound("success")`, rejected ones `playSound("reject")`.
6. Lab logic: compare `src/lib/filename-classifier.ts` and
   `src/lib/execution-states.ts` with `source/lab/*.dc.html` and report any
   difference; boot sector: replace the reconstructed code and notes with
   revision `e966889` only if that source is available in the repository or
   handoff, otherwise keep what exists and say so. No placeholder may render on
   a public page: leave out what is unknown and list it.
7. Validate: `pnpm --filter @raioviajante/lab format:check lint typecheck build`,
   then `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate`.
8. The owner must still add `../../packages/design` to the Vercel Ignored Build
   Step of dump and docs (D10). Stage files explicitly; one logical step per
   commit.

### Phase 4d: lab (`apps/lab`, Astro)

1. The React dependencies, `react()` integration, and `apps/lab/AGENTS.md`
   clarification were completed in Phase 3. Update `apps/lab/docs/design.md`
   for the new shell during the lab migration.
2. Replace `src/layouts`, `Header.astro`, `Footer.astro` and `src/styles/global.css` with the shared `Shell`, `styles.css` and the `behavior` script. Switch off the old `@raioviajante/design/tokens.css` import.
3. Pages: experiments index (filter all/active/done, fidelity explained, notebook), the three experiments with `LabBench`, `BenchBand`, `StateMark`, `ActionButton`, terms, privacy, `404.astro`.
4. Experiments use the existing logic modules (`src/lib/filename-classifier.ts`, `src/lib/execution-states.ts`) and the handoff logic in `source/lab/*.dc.html` (`class Component`, `renderVals()`):
   - 001 filename classifier: suffix mirrors Python `Path.suffix` (last dot, ignored at index 0 and at the end, lowercased); categories are those on the docs Sweep page. Compare with `src/lib/filename-classifier.ts` and report differences.
   - 002 execution states: actions start/succeed/fail/cancel; rejected actions log `rejected: <action> from <STATE>` and change nothing; times from the browser clock; "new example" resets. Verify the rules against the Orbit source (assumed: start from QUEUED; succeed and fail from RUNNING; cancel from QUEUED or RUNNING) and report differences.
   - 003 boot sector: five sections, source and note each, previous/next, progress `n / 5`. Replace the reconstructed code and notes with revision `e966889`; keep `[NOTE FROM LEARNING NOTES]` where there is no real note.
   - Accepted actions call `playSound("success")`, rejected ones `playSound("reject")`; results live in an `aria-live` region.
5. Keep the existing `/search` page, menu item, and build-time index working
   after the lab shell and experiment changes; keep numbers 001–003.
6. Validate: `pnpm --filter @raioviajante/lab format:check lint typecheck build`.

### Phase 4e: cross-cutting

- Each app's host 404: Next.js `not-found.tsx` (root, dump); Astro `src/pages/404.astro` (docs, lab). Confirm each builds a `404.html` / not-found response that Vercel serves.
- Update `docs/architecture.md` and each app's `docs/design.md` so they describe what is implemented, not what is planned.
- Update `docs/deployment.md` when the owner confirms the dump and docs Ignored
  Build Steps were applied in Vercel.

### Report back

List every `[CONFIRM]`, `[DATE]`, `[VERSION]`, `[COMMIT]` and similar placeholder left in the apps, every difference from the reference pages and why, and the open questions: D1 (what the search head animates), D4 (root colors), the root search line, and whether the new sound voices are acceptable.
