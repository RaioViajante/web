# Architecture

Lab is the experiments app in the RaioViajante monorepo. Each app has its own
deployment; shared code belongs in packages, never in another app.

Astro builds static pages. React is a build-time renderer for the shared design
components and app-specific compositions; there is no React hydration. Small
plain TypeScript Astro scripts enhance experiments and the index filter.

```text
src/
  components/     LabFrame, LabIndex, experiment page parts and legal content
    surfaces/     static React bench markup and Astro browser scripts
  data/           experiments.ts and verified boot-sector source excerpts
  layouts/        BaseLayout.astro, ExperimentLayout.astro
  lib/            pure filename and execution logic, filter count, title convention
  pages/          index, search, search-index.json, terms, privacy, 404
    experiments/  [slug].astro — three static experiment routes
  styles/         lab.css — index and experiment-specific layout
 tests/            Node unit tests for classifier, lifecycle rules and filter count
```

`BaseLayout.astro` owns metadata (the shared `SeoHead`, fed by `src/lib/seo.ts`,
which also lists the pages for `/og/` cards and `sitemap.xml`) and font loading. `LabFrame` configures the
package's shell, navigation and footer. Shared behavior handles search, sound,
avatar animation and block interactions. No copied shared markup, assets or
styles live in lab. Every experiment stays inside the shared content column;
wide code and classification output scroll within their blocks.

Experiment IDs, status, fidelity, provenance and publication dates come from
`src/data/experiments.ts`. The dynamic route statically renders each surface.
The classifier and execution functions are shared by the browser and Node tests.
Boot models are highlighted at build time and its five panels switch locally.
No server, database, CMS, sibling build dependency or experiment persistence is
needed. Search uses the shared static JSON index and client-side filtering.
