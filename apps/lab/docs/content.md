# Content

## Experiment content model

Experiments are centralized in `src/data/experiments.ts` rather than hardcoded into page markup, so adding, removing, or reordering one is a data change, not a markup change. Each record includes at minimum:

- `id` — the display number (e.g. `"017"`).
- `slug` — used for the route, `/experiments/<slug>/`.
- `title`, `description` — shown in the homepage list.
- `status` — `"active"` or `"archived"`.
- `created` — ISO date.
- `source` — GitHub URL, when the experiment is real.
- `what` — the prose paragraph on the experiment page.
- `notes` — optional additional prose.
- `layout` — `"canonical"` (default) or `"wide"`, see [`design.md`](design.md).
- `surface` — optional key selecting a bespoke experiment component (e.g. the parser playground grid).

No database, no CMS — a single typed array is the entire content model for now.

## Demonstration experiments

`parser-playground`, `cron-visualizer`, `filesystem-classifier`, and `boot-sector` are temporary demonstration entries carried over from the approved design reference. Their purpose is only to establish the reusable homepage list and experiment page system — they are not real projects and should not be expanded with fictional technical detail. They will be replaced with real experiments from actual RaioViajante projects as those exist.

## Page title convention

- Homepage: `lab · raioviajante`
- Experiment page: `<experiment title> · lab`

Matches the middle-dot title convention already used by `raioviajante.com` (`%s · raioviajante`). Never duplicate the site name across both halves of the title.
