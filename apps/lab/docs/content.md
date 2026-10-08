# Content

## Real experiments

Every experiment must be grounded in actual project code, tests, artifacts, or explicitly framed design research. An unfinished project is welcome; invented functionality is not. Browser reproductions must stay faithful to their referenced revision and must not imply that a project's unimplemented scheduler, compiler, runtime, or other planned feature exists.

The initial collection was published in Lab on 2026-09-13:

| ID  | Experiment          | Status | Provenance                                                              |
| --- | ------------------- | ------ | ----------------------------------------------------------------------- |
| 003 | boot sector         | done   | x86-os-experiment `e966889`: actual assembly and documented BIOS output |
| 002 | execution states    | active | Orbit `cd97666`: Execution lifecycle rules and domain tests             |
| 001 | filename classifier | active | Sweep `3544d36`: final-extension classifier and tests                   |

The classifier reproduces Python 3.14 POSIX suffix behavior, lowercases the suffix, and applies Sweep's category sets. It does not inspect files. Execution states reproduces the domain guards, including cancellation from queued/running, nonblank failure messages, and no success/failure restriction on integer exit-code values. Its timestamps are browser samples; no commands run or state persists. The boot page uses real assembly excerpts with comments omitted and attributes its result to the learning notes. It contains no generated machine bytes or emulator.

## Numbering and publication

The earlier demonstration numbers were design fixtures. Real numbering starts at `001`.

- Assign sequential IDs and display at least three digits.
- Once published, a real experiment keeps its number forever. Never reuse it.
- Revisions do not change an experiment's number.
- Keep the data array in newest/highest-number-first order; the homepage uses that order.
- `created` means the ISO date of publication in Lab, not the source project's commit date.
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
