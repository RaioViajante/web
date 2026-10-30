# Content

## Real experiments

Every experiment must be grounded in actual project code, tests, artifacts, or explicitly framed design research. An unfinished project is welcome; invented functionality is not. Browser reproductions must stay faithful to their referenced revision and must not imply that a project's unimplemented scheduler, compiler, runtime, or other planned feature exists.

The initial collection was published in Lab on 2026-09-13:

| ID  | Experiment          | Status | Provenance                                                              |
| --- | ------------------- | ------ | ----------------------------------------------------------------------- |
| 003 | boot sector         | done   | x86-os-experiment `e966889`: actual assembly and documented BIOS output |
| 002 | execution states    | active | Orbit `cd97666`: Execution lifecycle rules and domain tests             |
| 001 | filename classifier | active | Sweep `3544d36`: final-extension classifier and tests                   |

Every experiment has an English and a Brazilian Portuguese version. The
Portuguese versions are authored by hand, keep the English `contentId` (the
experiment `id`) and `originalLocale: en`, and live at independent slugs:

| ID  | English slug          | Portuguese slug             |
| --- | --------------------- | --------------------------- |
| 003 | `boot-sector`         | `setor-de-boot`             |
| 002 | `execution-states`    | `estados-de-execucao`       |
| 001 | `filename-classifier` | `classificador-de-arquivos` |

Stable facts (`id`, `project`, `revision`, `created`, `source`, `status`,
`fidelity`, `surface`) are inherited from the English record and checked by
`validateExperiments`; only the authored text differs. The `created` value
describes the experiment, not when a translation was published.

Visible labels and strings are never raw keys. `status` and `fidelity` render
through the locale catalog (`src/lib/copy.ts`), `created` renders as a long
date in the page locale with the ISO value in `<time datetime>`, and the
fidelity and related rows of each surface live in
`src/data/experiment-content.ts`. Related rows that point to English pages
(the learning notes and the Dump posts the rows deliberately keep in English)
say so in words ("em inglês"),
carry `hreflang="en"` and mark the English title with `lang="en"`.

Technical identifiers stay exact in both languages: Orbit's status values
(`QUEUED`, `RUNNING`, ...) and field names, Sweep's category values (`Images`,
`Documents`, `Archives`, `Other`), assembly, registers, hex values and
revisions. The Portuguese classifier shows translated display names for the
categories in the table and in the live summary (`Imagens`, `Documentos`,
`Arquivos compactados`, `Outros`, the names the published page has always
used), while the destination preview keeps Sweep's real folder name
(`~/Downloads/Images/...`), with that folder segment marked `lang="en"`. The
classification logic only ever sees the identifiers. Operation names (`start`, `succeed`, `fail`, `cancel`) are Orbit's
method names: Portuguese buttons and messages use verbs ("iniciar",
"concluir com sucesso", "falhar", "cancelar") and the transition table shows
the identifier next to the verb.

Both languages render an experiment's `notes` (provenance: the pinned revision
and the limits of the page) under Fidelity. The English pages did not between
the shared-design migration and this localization, although the notes were
always in the record; see [i18n.md](i18n.md).

The classifier reproduces Python 3.14 POSIX suffix behavior, lowercases the suffix, and applies Sweep's category sets. It does not inspect files. Execution states reproduces the domain guards, including cancellation from queued/running, nonblank failure messages, and no success/failure restriction on integer exit-code values. Its timestamps are browser samples; no commands run or state persists. The boot page uses real assembly excerpts with comments omitted and attributes its result to the learning notes. It contains no generated machine bytes or emulator.

## Numbering and publication

The earlier demonstration numbers were design fixtures. Real numbering starts at `001`.

- Assign sequential IDs and display at least three digits.
- Once published, a real experiment keeps its number forever. Never reuse it.
- Revisions do not change an experiment's number.
- Keep the data array in newest/highest-number-first order; the homepage uses that order.
- `created` records the experiment's original Lab date, not the source project's commit date or the date a translation went live. It is not a document lifecycle date and never supplies `lastmod` or `dateModified`.
- Source revisions belong in provenance notes separately.
- `done` describes the bounded Lab experiment, not completion of its originating project.

## Experiment content model

`src/data/experiments.ts` contains the typed content array:

- `id`, `slug` — permanent display number and route identity.
- `title`, `description` — homepage copy.
- `status` — `active`, `done`, or `archived`.
- `project`, `revision`, `fidelity` — pinned provenance and browser fidelity.
- `created` — Lab publication date.
- `source` — optional, publicly accessible repository URL.
- `what`, optional `notes` — purpose, boundaries, and provenance.
- `surface` — optional key selecting a bespoke Astro component.

No database, CMS, or plugin registry is needed. Keep the approved shell and shared content column intact.

## Source links

Check intended links without authentication before publishing them. Omit `source` when the repository is not publicly accessible; never substitute a fake destination. Local evidence can support approved experiment content without exposing additional private source material.

On 2026-09-13, unauthenticated requests returned 200 for the Sweep and x86-os-experiment repositories and 404 for Orbit, so only the first two rendered source links. On 2026-10-07 the Orbit repository and its pinned revision `cd97666` returned 200 unauthenticated, and execution states now renders its source link too. The boot page's revision-specific assembly and learning-note links also returned 200.

Keep the referenced revision visible in notes. When changing behavior, recheck the source and tests and update provenance deliberately.

## Retired fixtures

The old parser, cron, and filesystem-classifier fixture routes are removed without redirects. The boot-sector slug now contains the real source experiment. References to the design export's demonstrations describe historical visual reference material, not current functionality.

## Page title convention

- Homepage: `lab — things may break.`
- Experiment: `<experiment title> — lab`

`src/lib/site.ts` owns the existing convention; content changes do not redefine it.
