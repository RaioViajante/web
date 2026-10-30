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
  data/           experiments.ts (originals and translations), experiment-content.ts
                  (fidelity and related rows per locale), boot-sector.ts (source
                  excerpts plus per-locale section text)
  layouts/        BaseLayout.astro, ExperimentLayout.astro
  lib/            pure filename and execution logic, copy.ts and bench-copy.ts
                  (typed catalogs), routes.ts (route registry), search.ts,
                  plural.ts, date.ts, template.ts, filter count, title convention
  pages/          index, search, search-index.json, terms, privacy, 404, and the
                  same tree under pt/ (no pt/404: Lab's 404 stays English)
    experiments/  [slug].astro — three static experiment routes per locale
  styles/         lab.css — index and experiment-specific layout
 tests/            Node unit tests for classifier, lifecycle rules, catalogs,
                   plurals, dates, routes and search suggestions
```

`BaseLayout.astro` owns metadata (the shared `SeoHead`, fed by `src/lib/seo.ts`,
which also lists the pages for `/og/` cards and `sitemap.xml`) and font loading. `LabFrame` configures the
package's shell, navigation and footer. Shared behavior handles search, sound,
avatar animation and block interactions. No copied shared markup, assets or
styles live in lab. Every experiment stays inside the shared content column;
wide code and classification output scroll within their blocks.

Experiment IDs, status, fidelity and provenance come from
`src/data/experiments.ts`. Each published version declares a stable `contentId`,
locale, original locale and independent slug. The English route keeps its
original path; `/pt/experiments/[slug]` builds only authored Portuguese
versions. Validation rejects duplicate versions, changed shared facts and
missing originals (unless a withdrawn original has an explicit nonpublic
provenance record). `created` and `revision` are experiment facts, not document
publication or modification dates. The locale inventory supplies counterpart
metadata; no missing version is inferred from an English slug.

`src/lib/copy.ts` and `src/lib/bench-copy.ts` are Lab's app-local typed
catalogs: `Record<LocaleId, ...>` with `satisfies`, so a missing locale or key
fails type checking and nothing falls back to English. Code that depends on the
locale reads its strings from them (or from the registry); there are no
`locale === ...` ternaries over user-facing text. Counts use
`src/lib/plural.ts` (CLDR categories from `Intl.PluralRules`, plus an explicit
zero wording where CLDR would say "one"; see [i18n.md](i18n.md)), and dates use
`src/lib/date.ts` (`Intl` with the registry locale, UTC, ISO in
`<time datetime>`). Each bench renders its locale's strings into the page at
build time (a `data-copy` attribute plus `data-locale`); the plain TypeScript
scripts only fill `{placeholders}` (the classifier also gets its `Intl` locale string; the index filter gets its result sentences, one per filter, already worded), and never consult
the browser's language or storage. `src/lib/routes.ts` is the route registry for
home, search, Terms and Privacy; the experiments are content records.
Portuguese search has its own static index (`src/lib/search.ts` builds both
indexes) and explicit suggestions, each of which finds a published Portuguese
experiment (tested). The Portuguese Terms and Privacy pages are faithful
translations of the English text, which stays authoritative. Lab participation
is declared in `site/locales.ts`.

The dynamic routes statically render each surface.
The classifier and execution functions are shared by the browser and Node tests.
Boot models are highlighted at build time and its five panels switch locally.
No server, database, CMS, sibling build dependency or experiment persistence is
needed. Search uses the shared static JSON index and client-side filtering.
