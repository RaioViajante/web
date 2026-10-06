# raioviajante design system

> Imported from the design handoff (`raioviajante-design/`, local only). Differences from the original are limited to the image locations, the resolved `[CHECK]` values, and the sound notes. Sections the repo has not implemented yet are tracked in [design-migration-plan.md](design-migration-plan.md).

One visual identity for four sites with four different jobs.

| site             | job                     | signature features                                                    |
| ---------------- | ----------------------- | --------------------------------------------------------------------- |
| raioviajante.com | index: who, what, where | projects, latest writing, gallery                                     |
| dump             | reading                 | series, related posts, comments, code walkthroughs                    |
| docs             | reference               | left nav + "on this page", search, callouts, CLI reference, changelog |
| lab              | running things          | benches, fidelity, notebook                                           |

The frame never changes between sites: sound toggle, sidebar, centered page header, numbered sections, footer. Only what lives inside the frame does.

---

## 0. Build once, reuse everywhere

Everything below that appears on more than one page or site is **one shared implementation**, imported by raioviajante.com, dump, docs and lab. Never copy markup or CSS between apps.

| shared piece                                        | used by          | pass in                                                 |
| --------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| `tokens.css` (or a shared ui package)               | all four sites   | —                                                       |
| Shell: sidebar + sound toggle + column + footer     | every page       | site, PAGES items, active item, optional "on this page" |
| Sound player + preference                           | every page       | `data-sound` on elements                                |
| Search menu item ("Ask RaioViajante")               | every sidebar    | number, shortcut label                                  |
| Search page                                         | dump, docs, lab  | the site's question, index scope                        |
| Index header (avatar, name, line)                   | every index page | name, line                                              |
| Section heading `01.1 Title`                        | everywhere       | number, title                                           |
| Dotted leader row                                   | everywhere       | label, value, href                                      |
| Soft blocks: code, terminal, diff, callouts, tables | dump, docs, lab  | content                                                 |
| Lab bench frame                                     | lab              | label, children                                         |
| Prev / next, related rows                           | dump, docs, lab  | links                                                   |
| Legal page template                                 | all four sites   | site-specific sections                                  |
| 404 page                                            | all four sites   | the site's line, "try instead" links                    |

**Images** live in `packages/design/assets/`, shared by all apps, never duplicated per site. Components import them from the package (`Art`, `art`, `gallery`).

| file                                            | where                                                                         |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `character/avatar.png`                          | index headers (112px)                                                         |
| `search/search-character.png`                   | search page, full pose next to the bubble (150px)                             |
| `search/head/static.png`                        | search menu item (30px) and "ask RaioViajante" rows (34px) — never below 28px |
| `character/avatar-frames/frame-01…10.png`       | reserved for the root avatar animation                                        |
| `stickers/work-of-art.png`                      | empty search                                                                  |
| `stickers/not-found.png` ("404 page not found") | every 404                                                                     |
| `gallery/*.webp`                                | root gallery                                                                  |

All files are exports of the original artwork. The screenshot crops from the design handoff were not used.

## 1. Principles

1. **One typeface.** Noto Sans Mono sets everything. Hierarchy comes from size, weight and position.
2. **The page is gray.** Color appears only inside code blocks and lab bench output, where it identifies tokens.
3. **Words, rules and position carry meaning.** Status is a word. Warnings escalate by rule weight. Selection is an underline or a 1px left rule.
4. **Whitespace organizes, not boxes.** Only code blocks and lab benches get a frame.
5. **Soft blocks.** Everything that interrupts prose (code, terminals, notes, tables, lab benches) sits on one surface: `#212121`, 10px corners, no border, label above. Only warnings are outlined. Sections are never boxed.
6. **Sound and character are identity.** Every site uses the root's sounds, the avatar and the sticker.
7. **Never:** gradients, glow, shadows, bento grids, colored badges, emoji, a second typeface, an accent color for links.

## 2. Tokens

All tokens live in `packages/design/styles/tokens.css`. The two `[CHECK]` values were resolved against the root site: `--bg` is `#191919` (the design measured `#1b1b1b`) and `--font` keeps the root's Noto Sans Mono stack.

| token           | value                      | use                                |
| --------------- | -------------------------- | ---------------------------------- |
| `--bg`          | `#191919`                  | page (root's value)                |
| `--fg`          | `#edf1f6`                  | text, titles, current item (root)  |
| `--fg-2`        | `#8792a1`                  | secondary text (root muted)        |
| `--fg-3`        | `#858b94`                  | section numbers, caps labels, meta |
| `--line`        | `rgba(215, 223, 234, 0.3)` | rules, frames (root)               |
| `--dots`        | `#444444`                  | dotted leaders                     |
| `--rule-note`   | `#555555`                  | quotes, NOTE                       |
| `--code-bg`     | `#202020`                  | code blocks, benches               |
| `--code-inline` | `#262626`                  | inline code                        |

Syntax: keyword `#d8bd84` · type `#bfa6d9` · function `#8fb8d6` · string `#a8c791` · number `#de9f8c` · comment `#7b818a` italic · punctuation `--fg-2`.

## 3. Typography

| role         | size / weight                   | where                                     |
| ------------ | ------------------------------- | ----------------------------------------- |
| index title  | 56 / 700                        | root, site index pages                    |
| page title   | 44–48 / 700                     | posts, docs pages, experiments            |
| section      | 17–18 / 700, number in `--fg-3` | everywhere                                |
| body         | 16.5 / 500 / line-height 1.82   | everywhere; root computed size            |
| code, tables | 13–13.5 / 1.75                  | everywhere                                |
| caps label   | 12–12.5, uppercase, +0.12em     | page label, sidebar groups, table headers |

## 4. Structure (shared by all sites)

- **Sound toggle** — `SOUND ON` at the top center of the **content column** (not the page), exactly like the root.
- **Sidebar** — caps group labels; items numbered `00.`, `01.`; the current item has a 1px `--fg` rule on its left. Groups: PAGES, ON THIS PAGE where useful, EXPERIMENTS on lab. **No SITES group** — the footer links the sites. Search is the last item of PAGES: `03. search ····· (avatar) ⌘K` — see `dump/search-brand.html`.
- **Page header** — centered: caps label (or breadcrumb in caps on docs), title, one line, meta row separated by middots. The first meta item is the status word in `--fg`.
- **Numbered sections** — `01.`, `01.1`, `01.2`. The same numbers appear in "on this page" and in search results.
- **Dotted leader** — `name ····· value` for lists, metadata, statuses, tags, related links.
- **Soft blocks** — callouts NOTE / IMPORTANT on `#212121`; WARNING outlined 1px `--fg-2`; DEPRECATED dotted. Quotes keep a 2px left rule.
- **Related rows** — `title ····· site ↗`. Every post, docs page and experiment links to its siblings on the other sites.
- **Prev / next** — caps label above title, no box.
- **Footer** — identical everywhere: four sites (current one in `--fg`), email, CNPJ, and that site's own Terms of Use and Privacy Policy.
- **Index header** — avatar (112px circle), site name, one line — like the root.
- **Search ("Ask RaioViajante")** — menu item ends in the hand-on-chin head (30px, peeking above the row) and `⌘K` (ctrl K off Mac, `/` also opens); on hover the head hops once and a "?" sticker bubble pops. The search page: the full search character asks in a white sticker bubble in the site's voice (root: "what are you looking for?", dump: "what are you curious about?", docs: "what do you need to look up?", lab: "what do you want to poke at?"); the bubble answers while you type ("found 4 things about “sweep”!", "hmm… nothing yet."); results are numbered leader rows grouped by site; scope "this site · everywhere"; empty search shows the sticker and "maybe I haven't built it yet."
- **Legal pages** — Terms of Use and Privacy Policy on every site: "In short" leaders first, then numbered sections; site-specific sections (dump comments via giscus, docs accuracy/search, lab experiments).

## 5. Site features

### dump

- Index: latest post featured, posts by month, series, follow along (RSS, GitHub).
- Post: reading progress line, "on this page" in the sidebar, numbered sections, code blocks (file name, language, copy, line numbers, highlighted lines), notes, metadata leaders, prev/next, related by tag, **try it in the lab**, comments (giscus with a custom theme built from these tokens).
- Archive and tags as leader lists; tags split into recurring / once.
- Search: numbered sidebar item `04. search  /`, opens the shared search page.
- The separate About page was removed; the root About covers it.

### docs

- Home: large search, projects with status, raioviajante standards, "reading these docs" (status meanings).
- Three columns: left tree nav, content, "on this page".
- Guide pages: breadcrumb label, status in meta, steps, tables, callouts, platform tabs, file trees, **try it and read more**, last updated + edit on GitHub.
- Reference pages: synopsis, commands, behavior matrix, arguments, output fields, exit codes, changelog, version selector.
- Search: numbered sidebar item `03. search  /` and a dotted search line on the home. It opens a full search page (no icon, no box, no key chips): caps label, plain input, results as numbered leader rows, selected result marked with the sidebar rule. Finds docs sections and dump posts from one shared index. Shortcut `/` on every site.
- **Design language** page rewritten for this system (the old one described a purple accent and serif prose).
- Callout and code styles: see `blocks/` (soft direction) — same rules on docs.

### lab

- Index: filter all / active / done, fidelity explained, notebook.
- **Fidelity** on every experiment: `runs here` (real logic in the browser), `simulated` (rules ported from a pinned revision), `source only` (real code, documented results).
- Experiment template: header `EXPERIMENT NNN · PROJECT` → 01 Question → 02 Bench → 03 Fidelity → 04 Related → prev/next. Numbers have three digits and are never reused.
- Bench: framed like a code block; caption states where it runs; bands for controls, output, state and history.
- Controls: accepted actions solid, rejected actions dotted but still clickable, one primary at most, underline toggles.

### Shared extras

- **404** — one design for all four sites (`404.html` for the root, `dump/404.html`, `docs/404.html`, `lab/404.html`): the "404 page not found" sticker floating gently, "I looked everywhere.", a line in the site's voice, the requested path in a soft block, "Try instead" leaders for that site, and "ask RaioViajante ⌘K". Build it **once** as a shared component; each site only passes its line and its links.

## 5b. Sound

Sound is part of the identity. Every site loads the **same sound files and the same preference** as raioviajante.com.

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

Rules: never play on page load; one preference across subdomains (localStorage is per subdomain, so the preference is the `rv-sound` cookie on `.raioviajante.com`; the root's old localStorage value is migrated on first read). There are no audio files: every sound is synthesized with Web Audio in `packages/design/sound/`, and `[ROOT: name]` means the voice the root already synthesizes for that kind of event. Under reduced motion, hover and typing sounds are skipped; sounds that confirm an action still play.

## 6. Interactive behavior (lab)

The static HTML in this bundle is a snapshot of the initial state. The working logic is in `source/lab/*.dc.html` (the `renderVals()` class at the bottom of each file).

- **001 filename classifier** — directory + filenames (one per line) → suffix, category, destination, counts. Suffix mirrors Python `Path.suffix`: last dot, ignored at index 0 and at the end, lowercased. Categories are the ones on the docs Sweep page.
- **002 execution states** — actions start / succeed / fail / cancel. Rejected actions log `rejected: <action> from <STATE>` and change nothing. Times from the browser clock. "new example" resets.
- **003 boot sector** — five sections, source + note per section, previous/next, progress `n / 5`.

Implementation: Shiki with a custom theme mapped to the syntax tokens (`packages/design/blocks/`), a build-time static search index per site merged client-side for "everywhere" (planned, Phase 3), and `@raioviajante/design` imported by all four apps.

## 7. To verify before shipping

- `[CHECK]` values in `tokens.css`: resolved (see section 2).
- **Orbit rules** assumed in 002: start from QUEUED; succeed and fail from RUNNING; cancel from QUEUED or RUNNING.
- **Boot sector** sections 2–5: code reconstructed from the dump post; notes are `[NOTE FROM LEARNING NOTES]` placeholders. Replace with revision e966889.
- Placeholders: `[VERSION]`, `[DATE]`, `[REVISION]`, `[COMMIT]`, exit codes, changelog entries, install commands.
- Series on dump (jobs-mcp, orbit, sweep) and reading times are illustrative.

- Legal pages: every `[CONFIRM]` and placeholder (license, host, analytics, retention, governing law). This is a template, not legal advice — have it reviewed.
- Artwork: done. The shared package ships the original artwork.
