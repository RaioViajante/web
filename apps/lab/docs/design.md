# Design

Lab uses `@raioviajante/design`: one shared shell, Noto Sans Mono, a fixed gray
palette, numbered sections, dotted leaders and soft benches. The rules are in
`docs/design-system.md` and the block contract in `docs/blocks.md` at the
repository root.

## Structure

- `BaseLayout.astro` loads shared `styles.css`, self-hosted Noto Sans Mono and
  `startBehavior()`. `LabFrame.tsx` renders the shared shell statically: PAGES,
  EXPERIMENTS, sound toggle, 739.2px content column and footer. No React hydrates.
- `LabIndex.tsx` uses the shared animated avatar and index header, all/active/done
  filters, descending permanent IDs, fidelity explanations and dated notebook.
  The notebook is an index anchor, not a separate route.
- `ExperimentLayout.astro` uses the shared header and numbered Question, Bench,
  Fidelity and Related sections. Previous/next follows ascending permanent IDs.
  Execution's transition table sits with its bench so section numbers stay
  consistent across the three experiments.
- Shared `LabBench`, `BenchBand`, `StateMark`, `ActionButton`, `ToggleButton`,
  `CodeBlock`, `Callout` and `TableBlock` supply every bench's frame and blocks.
  Assembly is highlighted at build time with the shared syntax theme.
- Search, Terms, Privacy and the host `404.html` use shared templates. Search
  shortcuts and the requested 404 path use shared browser behavior.
- `src/styles/lab.css` contains only the index list and experiment-specific
  arrangements. General bench helpers live in the design package. There are no
  local color literals, shell duplicates, Google Fonts or second typeface.

## Interactivity

Small Astro scripts enhance static React output. The classifier updates suffix,
category, destination preview and counts; reset and samples restore or append
input. Filename spaces are preserved, and Python 3.14 treats `image.` as suffix
`.` (category Other). This differs from the older design logic.

Execution actions show available state transitions with solid controls and
rejections with dotted controls that remain clickable. The state and every
field survive a rejection unchanged. Java's nonblank error-message requirement
and signed integer input restrictions apply; zero does not imply success.
Results and history use words, with live feedback independent of color or sound.

Boot's five sections have source, explanatory notes, selection, previous/next
and live progress. Section buttons support arrows, Home and End as well as Tab
and Enter/Space. The actual source excerpts and documented QEMU result are
preserved; the browser does not run an emulator. Without JavaScript the initial
section and a link to complete assembly remain available.

Sound comes from the shared map: accepted actions use success, rejected actions
use reject. Preference is the shared `rv-sound` cookie; nothing plays on load.

## Unknown facts

Public legal pages omit an update date, log retention, analytics assertions,
quoting/artwork permissions, snippet licensing and governing law until those
facts are confirmed. Source links are omitted for Orbit while its repository
is not public. The migration plan records omissions and reference differences.
