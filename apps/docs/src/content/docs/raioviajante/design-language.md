---
title: Design language
description: Shared tokens, typography, and restraint across the RaioViajante ecosystem.
tagline: One system, four sites, four jobs.
order: 2
group: raioviajante
status: stable
meta:
  - standard
  - applies to every raioviajante site
summary: shared tokens, typography, restraint
---

## Overview

raioviajante.com, dump, docs and lab share one visual identity while doing different jobs. The frame never changes between them: header, navigation, numbering, footer. Only what lives inside the frame does.

| Site | Job |
| --- | --- |
| raioviajante.com | index: who, what, where |
| dump | reading: posts, series, comments |
| docs | reference: guides, CLI, search |
| lab | running things: benches, fidelity |

## Tokens

Three grays carry the page. Two surfaces exist only for code and benches. Nothing else.

```css title="tokens.css"
:root {
  --bg: #191919; /* page */
  --fg: #edf1f6; /* text, titles, active */
  --fg-2: #8792a1; /* secondary, status */
  --fg-3: #8792a1; /* numbers, labels */
  --line: rgba(215, 223, 234, 0.3); /* rules, frames */
  --dots: rgba(215, 223, 234, 0.3); /* leaders */
  --block: #212121; /* code, notes, tables, benches */
  --block-inner: #262626; /* inline code, tabs */
  --radius: 10px; /* blocks; 6px controls, 5px inline */
  --font: "Noto Sans Mono", ui-monospace, monospace;
  --measure: 739.2px; /* content column */
}
```

The values are the ones raioviajante.com already used; the other sites inherit them from `@raioviajante/design`, which is the only place a color is written down.

## Typography

One typeface. Hierarchy comes from size, weight and position.

Noto Sans Mono sets everything: names, paths, prose and code. Uppercase is reserved for small labels: the page label above a title, sidebar group names and table headers.

| Role | Size and weight |
| --- | --- |
| Page title | fluid, up to 45.76px, weight 650 |
| Section number and title | 17.95px, weight 650, the number in `--fg-3` |
| Body text | 16.5px, weight 500, line height 1.82 |
| Code and tables | 13 to 13.5px, line height 1.6 to 1.75 |
| Page label | 13.7px caps, letter spacing 0.08em |

## Color

The page is gray. Color appears only inside code and bench output, where it identifies tokens. Status, warnings and selection are expressed with words, rules and position, never with hue.

```css title="syntax tokens"
:root {
  --syn-keyword: #d8bd84;
  --syn-type: #bfa6d9;
  --syn-function: #8fb8d6;
  --syn-string: #a8c791;
  --syn-number: #de9f8c;
  --syn-comment: #7b818a;
}
```

The text selection and the keyboard focus ring use one muted violet, `#b9a1d2`. It is never used for links.

## Structure

Every page is built from the same parts.

| Part | Rule |
| --- | --- |
| Page header | Centered: caps label (or breadcrumb), title, one line, a meta row separated by middots. The first meta item is the status word. |
| Sidebar | PAGES, numbered 00., 01. The current page has a 1px rule on its left. ON THIS PAGE sits under it where it helps. There is no SITES group: the footer links the sites. |
| Numbered sections | The number in `--fg-3`, the title in `--fg`. Sub-sections go 01.1, 01.2. The same numbers appear in "on this page". |
| Dotted leader | `name ····· value`: lists, metadata, statuses, related links, tags. |
| Soft block | Code, terminals, notes, tables, benches: one surface, 10px corners, no border, label above. Warnings are the only outlined block. Quotes keep a left rule. |
| Status word | active, exploring, done, stable, deprecated: plain text at the end of a leader. |
| Footer | Identical everywhere: the four sites, email, CNPJ, and the Terms of Use and Privacy Policy of that site. No site is marked as current. |
| Sound | SOUND ON at the top center of the content column, not the page. Same sounds and the same preference on every site. |

## Restraint

Whitespace does the organizing. Everything that interrupts prose (code, terminals, notes, tables, lab benches) sits on one soft surface. Only warnings get an outline. Sections themselves are never boxed: no cards, no shadows.

:::warning
Never use gradients, glow, shadows, bento grids, colored badges, icons where a word works, emoji, a second typeface, or an accent color for links.
:::

There is one exception to "no shadows": the tiles of the root gallery keep theirs, because they are artwork pinned to a board.

## Shared parts

Every part below exists once, in `@raioviajante/design`, and every site imports it.

- the shell: sidebar, sound toggle, content column and footer
- the page header, numbered sections, dotted leaders and previous/next
- code blocks, terminals, diffs, callouts and tables, highlighted at build time
- the search page and the search item in the sidebar
- the 404 and legal page templates
- the artwork and the sounds, which are synthesized in the browser
