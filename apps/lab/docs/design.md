# Design

## Source of truth

The approved Claude Design export lives at [`../reference/claude-export/`](../reference/claude-export/) (`Lab.dc.html`). It is read-only visual reference material: never modify, move, format, or commit it. Implement the intended design it represents, not any implementation bug introduced by the design environment itself. Bugs already identified and rejected during design iteration, which must not be reintroduced:

- Experiment surfaces growing to viewport width instead of staying inside the canonical column.
- Parser playground tokens exploding vertically instead of a compact two-column layout.
- Code escaping its bounding box instead of scrolling internally.
- A half-black/half-white theme icon instead of the clean crescent-moon / sun treatment.
- GitHub duplicated in the footer — GitHub only ever appears in the header.

## Shared RaioViajante visual identity

- **Background (dark):** `#18161b`
- **Foreground (dark):** `#ece7e0`
- **Accent (dark):** `#c3b3e0`
- **Canonical content width:** 680px
- **Responsive gutter:** `clamp(1rem, 4vw, 1.25rem)`
- **IBM Plex Mono** — identity, navigation, paths, labels, experiment IDs, metadata, statuses, code-adjacent UI.
- **Source Serif 4** — prose, descriptions, editorial voice.

Principle: **mono identifies, serif speaks.** Do not substitute fonts, and do not use mono for prose or serif for interface chrome.

## Header

`raioviajante ~ / lab`, GitHub icon on the right, sharing the canonical 680px container with the rest of the page. Normal document flow — not sticky, not fixed. No additional navigation links.

## Homepage

`lab/` heading, two short editorial lines ("things may break." / the longer description), then an `experiments/` list: number (mono), title (mono), description (serif), status (mono, accent when active). No cards, no thumbnails, no bento layout, no rounded containers — hierarchy is typographic, separated by hairline rules.

## Experiment page

Back link (`← lab/`), `<number> / <title>` heading, a metadata block (status, created, source), a `what` section in prose, an `experiment` section holding the experiment's surface, and an optional `notes` section. All of it shares the canonical column by default.

### Canonical vs. wide

The experiment surface defaults to the same 680px canonical column as everything else. A future experiment may opt into a `wide` layout only when it genuinely needs more horizontal space (a waveform editor, a timeline, a node graph, a large canvas, a code editor with a live preview). Neither current demo (parser playground, boot sector) uses `wide` — `experiment` is not a synonym for full-width.

## Theme selector

Ported from the real sibling implementations (`raioviajante.com` and `dump`'s `ThemeToggle` component and theme-toggle CSS), not reinvented and not approximated from the design export's screenshot-level detail:

- Fixed bottom-left, 40×40px, circular, 1px hairline border, understated.
- Dark mode shows a crescent moon (two overlapping filled circles); light mode shows a sun (filled circle + radiating strokes) in the warm `#a9822a` tone.
- Theme is stored in `localStorage` and applied via a `data-theme` attribute on `<html>`, set by an inline head script that runs before first paint — no visible flash, no layout shift.
- Persists across reloads and direct navigation; falls back to the visitor's `prefers-color-scheme` when nothing is stored yet.

## Footer

Three links only — `raioviajante.com`, `dump`, `docs` — understated mono type, a restrained top hairline rule, canonical 680px alignment. No GitHub text link (GitHub already lives in the header).

## Explicitly avoid

Generic documentation-SaaS aesthetics, excessive cards, bento grids, glassmorphism, glowing gradients, decorative blobs, fake browser/terminal chrome (no macOS traffic lights), skill bars, giant marketing hero sections, unnecessary animation.
