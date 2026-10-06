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
| 4. Migrate each site   | done        | root (4a), dump (4b), docs (4c) and lab (4d) done                                           |
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

### Docs date follow-up and Phase 4d: lab (done)

- Docs accepts optional `lastUpdated: "YYYY-MM-DD"` frontmatter, validated as an
  ISO calendar date. It wins over git; full git history is the fallback. No date
  element renders without either. Paths: `apps/docs/src/content.config.ts`,
  `src/lib/docs.ts`, `src/pages/[...slug].astro`; documented in
  `apps/docs/docs/design.md`. The owner should set `VERCEL_DEEP_CLONE=true` on
  the docs Vercel project. No production setting was changed.
- Lab uses `BaseLayout.astro`, `LabFrame.tsx`, the shared shell, search, footer,
  tokens, behavior and self-hosted Noto Sans Mono. `LabIndex.tsx` uses the
  animated avatar, all/active/done filters, fidelity and notebook. Notebook is
  `/#notebook`, not a new route. Permanent IDs and the real 2026-09-13
  publication dates are preserved. Search metadata now includes project and
  fidelity; its body retains descriptions, purpose and provenance.
- `ExperimentLayout.astro` and `ExperimentParts.tsx` render the shared header,
  Question, Bench, Fidelity, Related and ascending-ID previous/next. Shared
  `LabBench`, `BenchBand`, `StateMark`, `ActionButton`, `ToggleButton`,
  `TableBlock`, `CodeBlock` and `Callout` supply the surfaces. Browser logic is
  small plain TypeScript in the three Astro surface scripts; React renders
  statically, with zero hydrated islands and no browser React runtime loaded.
- Filename: directory, filenames, live suffix/category/destination/counts,
  samples and reset. The category sets match the existing Sweep guide. The
  existing Python 3.14 POSIX suffix helper is retained. Differences from the
  design logic: `image.` has suffix `.` (still Other); filename spaces are
  preserved; multiple leading dots and POSIX path normalization follow Python.
  The design discarded trailing dots and trimmed filenames. Tests cover the
  requested five cases and further path/dot/space cases.
- Orbit: verified read-only against `Execution.java` and `ExecutionTest.java`
  at `cd97666` in the local source repository. All state guards match the
  reference: start from QUEUED, succeed/fail from RUNNING, cancel from either.
  Differences: real `fail` rejects blank error messages using Java whitespace
  rules; the design accepted them and substituted `(empty)`. The browser
  accepts only signed Java integers rather than coercing invalid/empty input
  to zero as the design did. Neither success nor failure restricts the value
  of a valid integer exit code. Rejected actions preserve every field and
  log `rejected: <action> from <STATE>`. Browser timestamps retain ISO precision.
  New example resets state, inputs and history. Orbit's source link stays
  omitted because its public availability is not established.
- Boot: existing lab excerpts were already real. Verified all five against
  `src/main.asm` and `docs/01-boot-sector.md` at `e966889` in the local source
  repository. `src/data/boot-sector.ts` retains them; no reconstructed source
  was imported. Initialization includes `mov si`, `call puts`, `hlt` and the
  halt loop; printing includes `mov bh, 0x00`; the ending is the actual
  `times 510 - ($ - $$) db 0` and `dw 0xAA55`. Comments are omitted, section
  order groups by purpose, and blank lines are retained. Five selectable
  sections, source/notes, previous/next, live progress, keyboard arrows/Home/End
  and shared copy controls replace disclosures. The result is attributed to
  the notes; no assembly, boot or QEMU execution was performed here.
- All bench action outcomes use the shared success/reject sounds, words and
  solid/dotted controls. Rejected controls stay clickable and keyboard
  reachable. Live regions report classification, lifecycle feedback and boot
  selection/boundaries. No sound plays on page load.
- Terms, Privacy and the host `404.html` use shared templates. The unknown
  values below are omitted, not filled. The 404 requested path is supplied at
  runtime, and an unknown preview route returns HTTP 404 with this page.
- Shared additions: configurable section heading controls and search label,
  general bench layout helpers, keyboard input focus and visually hidden live
  text. Long leader values now shrink on narrow pages while metadata labels
  keep whole words. Soft-block spacing remains shared.
- Removed local duplicates: `apps/lab/src/components/Header.astro`,
  `Footer.astro`, `src/styles/global.css`; old layout/surface styles were
  replaced in place. The unused wide-layout field was removed; all three
  experiments use the shared column. No artwork was copied, renamed or
  deleted in this phase. The local handoff and committed playground are
  untouched.
- Updated `apps/lab/AGENTS.md`, lab's design/architecture/content/development
  docs, its README and repository `docs/architecture.md` to describe the final
  implementation. Lab now exposes a `test` script using Node's built-in runner.

Reference differences retained deliberately:

- The established shared root tokens, type sizes, spacing, animated avatar,
  mobile sound-first order, two-column PAGES list and mobile stacked pager take
  precedence over the older static snapshots. At desktop width the long
  filename-classifier sidebar label wraps. Legal/404 host labels and search
  layout follow the shared templates. No per-app shell overrides were added.
- Execution's transition table stays with Bench, keeping Fidelity/Related at
  03/04 on every experiment. The reference used a separate Transition rules
  section and 04/05 for Fidelity/Related on that page.
- Controls retain the shared 44px minimum instead of the reference's smaller
  reset/sample controls. The classifier has an explicit try action as well as
  live updates. Wide result tables scroll inside their bench on mobile.
- Source revisions, publication dates and notes use existing verified facts.
  Placeholder facts in the reference are omitted, as required for public pages.

Unknown facts omitted from lab's public pages (still unresolved in the handoff):

- `[DATE]`: legal last-updated dates.
- `[LICENSE OR ALL RIGHTS RESERVED]`, `[LICENSE FOR SNIPPETS]`: general text
  and snippet licensing claims. Repository-specific source licenses are named
  only as such; no blanket permission is invented.
- `[CONFIRM]`: quoting permission, artwork reuse permission and governing law.
- `[NONE OR TOOL]` / tracking `[CONFIRM]`: analytics or blanket tracking claims.
- `[RETENTION]`: host log retention.
- `[HOSTING PROVIDER]` is resolved from repository deployment docs (Vercel).
  Cookie storage and `[CONFIRM PER EXPERIMENT]` are resolved by the implemented
  shared preference and browser-only experiment code; Google Fonts is removed.
- Classifier `[DATE]` / `[REVISION]` and boot note placeholders are resolved
  from existing publication/provenance records and verified source. Nothing
  unknown was substituted. The handoff originals remain untouched.

Current relevant tree:

```text
packages/design/
  components/       shared shell, parts, blocks, lab, templates, search, avatar
  styles/           tokens, base (bench helpers), blocks, search
  sound/ blocks/ search/ assets/ behavior.ts
apps/lab/
  src/components/   LabFrame, LabIndex, ExperimentParts, LegalPages, LabNotFound
    surfaces/       three static React benches + three Astro browser scripts
  src/data/         experiments.ts, boot-sector.ts
  src/layouts/      BaseLayout.astro, ExperimentLayout.astro
  src/lib/          classifier, execution rules, title convention
  src/pages/        index, experiments/[slug], search, search-index, legal, 404
  src/styles/       lab.css (lab-specific arrangements only)
  tests/            filename and lifecycle unit tests
apps/docs/           explicit date schema, date resolver and conditional footer
```

### Checks run

- Docs follow-up and Phase 4d: under Node 24.20.0 and pnpm 12.8.1,
  `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate` passed:
  format checks, lint, typechecks, 50 design tests, 102 dump tests, 42 lab tests
  and production builds for all four apps. Docs' separate `typecheck` and
  `build` also passed. Six isolated date-resolver cases passed: explicit
  frontmatter, full git fallback, shallow clone, untracked page, missing path
  and unavailable git. An existing Node module-type warning did not fail checks.
- Phase 4d browser pass: Chromium screenshots and reference comparisons for
  all eight lab pages at 1440px and 390px. No horizontal overflow, missing
  visible images, console errors, rendered placeholders or hydrated islands.
  Every experiment was exercised with mouse and keyboard separately at both
  widths, including all 20 lifecycle state/action pairs per run (80 total),
  rejected-field immutability, integer/blank-message guards, filename edge
  cases and injected text, filters, all five boot sections and both boundaries,
  code copying, search shortcuts/navigation and the unknown-path host 404.
  Shared success/reject events and sound-cookie persistence passed. Everywhere
  search used the real locally built indexes through intercepted cross-origin
  requests; this does not verify production endpoints. axe, full contrast
  auditing and listening to sound voices remain Phase 6 work. No boot/QEMU
  execution or production deployment was performed.
- This session's implementation commits: `278cdff` docs dates; `bd705ed`
  pinned classifier/lifecycle tests; `b1e1193` shared bench/page helpers;
  `3e91107` lab migration. A separate documentation commit records this report
  and the Phase 5/6 handoff. Nothing was pushed.
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

Phases 0–4 and the docs date follow-up are complete. **Do Phase 5 next.**
Do not redo the lab migration. Phase 6 follows Phase 5 in a subsequent session
unless the owner explicitly requests both. No code has been pushed.

### Before either session

1. Stay on `feat/design-migration`; read `git status --short --branch` and
   `git log --oneline -20`. Preserve any uncommitted playground or owner edits.
   Activate Node 24.20.0 from `.nvmrc` and pnpm 12.8.1.
2. Read this file's brief, decisions, Status and handoff; root `AGENTS.md`, each
   affected app's `AGENTS.md`, `docs/design-system.md`, `docs/blocks.md`, and
   the affected app's design/development docs.
3. Shared-only implementations, no color literals, no browser React on Astro,
   no copied artwork or invented facts. Stage explicit files/hunks, review the
   staged diff and commit each validated logical step. Never push, amend,
   rebase shared commits or delete the local design handoff.
4. Production settings are owner work: docs needs `VERCEL_DEEP_CLONE=true`;
   dump and docs need Ignored Build Steps watching `../../packages/design`
   (see `docs/deployment.md`). Do not change settings or claim deployment
   without explicit owner authorization and actual evidence.

### Phase 5 — finish ecosystem features

1. Audit root/app `AGENTS.md` and `CLAUDE.md` for stale pre-migration wording.
   Update them consistently with the actual shared shell, tokens, blocks,
   artwork, sound and framework rules. Lab's final approach is already recorded;
   `apps/lab/CLAUDE.md` delegates to its `AGENTS.md`.
2. Inventory every route and current metadata. Complete titles, descriptions,
   canonical URLs, Open Graph metadata and brand-style OG images on all four
   apps. Use shared implementation for any repeated artwork/composition;
   keep framework-specific route generation in each app. Preserve dump RSS;
   complete sitemaps including search/legal and real public content, excluding
   404 pages. Verify canonical slash conventions and host 404 behavior.
3. Audit accessibility across every route: landmarks and heading order, named
   controls, focus-visible, 44px touch targets, 4.5:1 text contrast, search/live
   regions, bench state marks, and outcomes conveyed without color or sound.
   Basic lab keyboard/live feedback is done; it is not a complete axe/contrast
   audit. Pay particular attention to the intentionally clickable dotted
   controls and their accessibility semantics. Change shared tokens/components
   when a fix is shared; check all consumers after doing so.
4. Audit performance: image dimensions and lazy loading, font preload/self
   hosting, layout shift, per-page JavaScript and actual network requests.
   Astro has zero hydrated islands. Its renderer emits a React client asset
   even for static pages; verify that unused emitted assets are not loaded.
   Bench scripts are about 1–3 KB each before compression, in addition to
   shared behavior/sound. Preserve minimal page scripts.
5. Keep unresolved legal facts out of public pages. No new source link for
   Orbit without verifying public access. Do not invent dates, licenses,
   retention, versions or deployment status. The original placeholders in the
   brief/handoff remain records, not publication content.
6. Run each affected app's prescribed checks. For shared/workspace changes run
   `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate` from the
   root under Node 24. Lab's 42 Node tests run as part of this command.
7. Commit validated steps; update Status and leave the exact Phase 6 handoff.
   Report what was checked, remaining unknown facts and infrastructure work;
   stop before Phase 6 unless authorized to proceed.

### Phase 6 — verify everything, then clean up

1. Start from completed Phase 5 and a documented worktree state. Run the full
   repo validation above and fix every failure without rewriting content or
   unrelated owner changes.
2. Use Playwright outside the repo to capture every public route at 1440px and
   390px (include real post/tag/doc routes and unknown-path host 404s). Open
   the read-only local reference HTML and compare. Preserve the intentional
   differences recorded in Status; do not undo the established root tokens or
   replace real experiment source with reconstructed examples.
3. Run axe on every page, check contrast and image/font layout shift, inspect
   missing assets and console/network errors. Exercise reduced motion and
   sound off/on. Audition the synthesized success/reject/new sound voices;
   prior sessions have not listened to them.
4. Keyboard test every site: Meta/Ctrl+K, `/` (ignored in inputs), arrows,
   Enter, Escape, tabs, code copy and all lab controls. Recheck all 20 lifecycle
   state/action pairs and rejected-field immutability; test Python 3.14 suffix
   edge cases, long/injected text, boot sections and both boundaries.
   Everywhere search should use real locally built indexes during offline
   checks; distinguish those checks from live endpoint verification.
5. Only after these checks pass, inventory obsolete exports/assets/styles with
   `rg`. Prove absence of real consumers before removing legacy design entries
   (`tokens.css`, `editorial-tokens.css`, `editorial.css`, `editorial-sound.ts`)
   or other dead migration code. Preserve all artwork still used by gallery,
   templates or playground. The design-system/block docs already live in
   `docs/`; maintain them there. Never delete or stage the local handoff.
6. Put cleanup in its own final `chore:` commit, using explicit staging, then
   rerun checks justified by those removals. Do not remove imported tags, rewrite
   history or push.
7. Update Status and report final trees, copied/renamed artwork (including the
   prior artwork map), deleted paths, unresolved facts, deliberate visual/source
   differences, exact validation/browser/axe results and commit list. The local
   handoff is owner-managed; it is safe to remove only after the reference
   comparison and final migration checks are complete.
