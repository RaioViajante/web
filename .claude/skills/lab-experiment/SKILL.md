---
name: lab-experiment
description: Build or change an interactive experiment on lab.raioviajante.com (apps/lab) - educational, deterministic, bilingual (EN/PT-BR), keyboard- and mobile-accessible, with provenance back to a real project or an honest "teaching model" label. Use when adding an experiment, changing an experiment's logic, copy or search entry, or reviewing one for fidelity and quality gates.
argument-hint: "[experiment idea or id]"
---

# lab-experiment

Rules live in `apps/lab/AGENTS.md`, `apps/lab/docs/content.md` (provenance,
numbering, content model), `docs/architecture.md`, `i18n.md`, `design.md`,
`development.md` in `apps/lab/docs/`, plus `docs/i18n.md`, `docs/performance.md`,
`docs/browser-checks.md`. Read them, then look at the newest experiment
(`scheduler-simulator`, `pathfinding-playground`) as the pattern. Git/PR flow:
`safe-pr`.

## 1. Decide what it is

State, before coding, which of these it is. The page, its `fidelity`, notes and
Portuguese copy must say the same thing:

- **Reproduction** of real project behavior at a pinned revision (filename
  classifier, execution states, boot sector). Check the real source and tests at
  that revision; sibling repos are read-only. Behavior must match, including
  edge cases.
- **Educational model** inspired by a project (scheduler simulator, tiny
  language). Say what is modeled, what the project does not have, and never imply
  the project implements it.
- **Teaching implementation** with no source project (pathfinding).

Never invent functionality for a project, imply emulation, or render an unknown
fact. A source link is published only if the repository is publicly accessible
(check unauthenticated); otherwise omit `source`.

## 2. Research and correctness

- Identify the canonical definition of the algorithm or rule set and write down
  the invariants the implementation must satisfy.
- Pure logic goes in `src/lib/<name>.ts` with no DOM access, so the Node test
  runner can import it (Node 24 native TypeScript). Benches in Astro `<script>`
  tags stay small, plain TypeScript, and only wire the DOM to the pure logic.
- **Deterministic**: no `Math.random`, `Date.now` or time-based branching in
  logic. Any randomness comes from a seeded generator or a fixed example. Same
  input gives the same output in both languages and across runs. Tie-breaks are
  specified, not left to iteration order.
- Tests (`apps/lab/tests/*.test.mjs`, `node --test`): invariants, the edge cases
  from the source, rejected actions preserving all state, boundaries of input
  limits, and Portuguese counts for 0, 1 and many.
- Add no dependency. The standard library and existing helpers suffice; a new
  dependency needs the user's approval, a lockfile change through pnpm only, and
  `allowBuilds` if it has install scripts.

## 3. Registration and routes

- `src/data/experiments.ts`: next sequential `id` (three digits, never reused),
  `slug`, `status`, `project`, `revision`, `fidelity`, `created` (the experiment's
  Lab date, not a translation date), `what`, `notes`, optional `source`,
  `surface`. Keep descending order (001-003 preserved).
- `src/data/experiment-content.ts` and `src/lib/<name>-copy.ts` for localized
  text; counts via `src/lib/plural*.ts`; `experiment-count.ts` and similar count
  helpers; a Portuguese slug independent of the English one; `contentId` (the
  experiment `id`) and `originalLocale` per `i18n.md`.
- Routes come from `src/pages/experiments/[slug].astro` and the `pt/` tree; the
  sitemap, `search-index.json`, hreflang pairs, `llms.txt` and OG image derive
  from the registry. Verify the new entry appears in each, in both languages,
  and that nothing else changed. Update `catalog.test.mjs`, `routes.test.mjs`
  and `localization.test.mjs` expectations deliberately.
- Add `apps/lab/docs/<name>.md` as the maintenance record, like the existing
  ones. Update `content.md` tables.

## 4. Interface rules

- Shared components, soft blocks, bench controls, legal and 404 templates from
  `packages/design`; `lab.css` only for lab-specific pieces. No local colors,
  fonts, shells, sound or art copies. Bench output may use shared syntax tokens;
  the page stays gray.
- Accepted action: `playSound("success")`; rejected: `playSound("reject")`; no
  sound on load. Outcome is always also in words and live-region text in the
  page's language; never color or sound alone.
- Keyboard: every control reachable by Tab in logical order, visible focus ring,
  Enter/Space activation, no keyboard traps, arrow-key patterns only when
  announced. Dotted (rejecting) controls stay focusable and clickable.
- 44px standalone targets; works at 320-1440px with no horizontal page overflow;
  long input wraps; code blocks scroll inside their container.
- Reduced motion: animations and auto-advancing playback stop or become
  step-by-step under `prefers-reduced-motion`; nothing moves on load.
- Input limits: cap text length, grid size, item counts and file sizes; show the
  limit and a plain message when exceeded; never hang the main thread (chunk or
  cap work). Treat all input as text: no `innerHTML` with user data, no `eval`
  or `Function`, no network requests, no storage (`docs/privacy-storage.md`,
  CSP in `docs/security-headers.md`). Files read by the page stay in memory;
  nothing is uploaded. New examples reset state; nothing persists.

## 5. Localization

Both languages ship together unless the user says otherwise. Portuguese is
authored, not literal: natural, plural-correct, with technical identifiers kept
exact (status values, field names, registers, hex, revisions) and wrapped in
`lang="en"` where English words appear in prose. Read `apps/lab/docs/i18n.md`
for counts, agreement with titles and shared vocabulary. Never a raw key in
visible text.

## 6. Performance

Budgets in `perf/budgets.json` are enforced by `pnpm perf:check`: Lab pages load
different client code per experiment. Keep the script small; do not edit a
budget to pass. If an increase is justified, change it in a reviewed commit
with the reason, as `docs/performance.md` describes.

## 7. Verify

```sh
pnpm --filter @raioviajante/lab format:check
pnpm --filter @raioviajante/lab lint
pnpm --filter @raioviajante/lab typecheck
pnpm --filter @raioviajante/lab test
pnpm --filter @raioviajante/lab build
```

Then, because shared files (`seo`, `perf`, e2e expectations) are often touched:
`pnpm browser:check`, `pnpm seo:verify`, `pnpm perf:check`, `pnpm links:check`
as relevant (`docs/operations.md` table). Failing gates are fixed at the cause.

Manual: drive the bench in both languages with the same inputs, keyboard only,
at 1440 and 390, reduced motion on. Serve your own build on a free port
(`pnpm --filter @raioviajante/lab exec astro preview --port <free>`), never a server you
did not start, and confirm its identity by checking a string unique to your
build before trusting what you see (`safe-pr` section 4). Do not claim
checks you did not run.

## 8. Report

State: type (reproduction/model/teaching), revision verified, deterministic
inputs tested, checks run, anything omitted as unknown, and Portuguese review
the owner should do.
