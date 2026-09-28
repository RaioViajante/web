# Architecture

## The RaioViajante ecosystem

RaioViajante's internet presence is split across separate subdomains, each its own app in the `RaioViajante/web` monorepo and its own deployment:

- **`raioviajante.com`** — identity / personal index
- **`dump.raioviajante.com`** — writing and thoughts
- **`docs.raioviajante.com`** — stable public technical documentation
- **`lab.raioviajante.com`** — experiments (this app)

## Role of this site

`lab.raioviajante.com` hosts experiments, prototypes, and technical curiosities that haven't decided what they are yet. Core rule: **the shell is consistent, the experiments are allowed to misbehave.** The global shell — header, footer, theme selector, canonical content width — stays disciplined and unmistakably RaioViajante across every route. An individual experiment page may introduce a specialized interactive surface inside its own content area, but experiments do not get permission to redesign the site around themselves.

## Stack

Astro (static-first, no server runtime needed), TypeScript, pnpm. No React, Vue, Svelte, or other UI framework — plain Astro components and, where an experiment needs interactivity, small inline/vanilla `<script>` progressive enhancement.

## Structure

```text
src/
  components/    shared shell pieces (Header, Footer, ThemeToggle)
                 and per-experiment surfaces (FilenameClassifier, ExecutionStates, BootSector)
  data/          experiments.ts — centralized experiment content model
  layouts/       BaseLayout.astro (site shell), ExperimentLayout.astro
  pages/
    index.astro                     the lab index ("/")
    experiments/[slug].astro        experiment page shell, one route per
                                     experiment via getStaticPaths
  styles/        global.css — design tokens, typography, base elements
```

## Routing

Experiment routes are generated statically from `src/data/experiments.ts` through a single dynamic route (`src/pages/experiments/[slug].astro`), producing clean paths like `/experiments/filename-classifier/`. There is no per-experiment route file — adding an experiment means adding a data record and, if it needs a bespoke visual surface, a small Astro component referenced from that record.

The classifier and execution surfaces share small pure TypeScript functions with their browser scripts under `src/lib/`. They reproduce referenced project behavior locally, without a server or sibling-repository build dependency. Boot source inspection uses native `details` / `summary` elements and works without JavaScript. Source metadata is optional; the layout omits its row when absent.

## Canonical vs. wide experiment layout

Every primary surface (header, homepage, experiment metadata, prose, and by default the experiment surface itself) shares one canonical column: `max-width: 680px` with a `clamp(1rem, 4vw, 1.25rem)` gutter. An experiment's data record carries an explicit `layout` field (`"canonical"` by default, `"wide"` opt-in) so a future experiment that genuinely needs more horizontal space (a waveform editor, a node graph, a large canvas) can request a breakout without making width-expansion the default behavior for every experiment. See [`design.md`](design.md) for the visual rationale.

## Theme system

The theme selector, color tokens, and persistence strategy are ported from the real implementations in the sibling `raioviajante.com` and `dump` repositories (not reinvented) — see [`design.md`](design.md) for specifics.
