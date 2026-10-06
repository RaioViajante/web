@AGENTS.md

## Claude Code

- Identify the target app under `apps/` before modifying files. Its own
  `CLAUDE.md`, when present, imports that app's `AGENTS.md`; read those
  instructions before changing anything there.
- Inspect the relevant source and documentation before making changes.
- Validate as described in `AGENTS.md` before committing.
- Never push without explicit authorization.
- Architecture: `docs/architecture.md`. Development workflow: `docs/development.md`.

## Design system migration

Applies to the work tracked in `docs/design-migration-plan.md` (branch
`feat/design-migration`). Read that file first: it holds the full spec, the
status of each phase, and exact instructions for the next session. Rules and
tokens: `docs/design-system.md`. Blocks: `docs/blocks.md`.

Working rules for every agent:

- Work on `feat/design-migration`. Do not create another branch.
- `raioviajante-design/` is the local design handoff. It is not part of the
  repository: never commit it, never delete it, never link to it from
  committed files. Copy what the repo needs (artwork into
  `packages/design/assets`, docs into `docs/`).
- Stage files explicitly. Never run `git add -A` or `git add .`.
- Commit after each coherent, validated step. Never push, amend, rebase shared
  commits, or force-push.
- Keep every `[CONFIRM]`, `[DATE]`, `[VERSION]`, `[COMMIT]`, `[REVISION]` and
  similar placeholder. Never invent facts to fill one.

Design rules:

- **Shared only.** Anything that appears on more than one page or site is one
  implementation in `packages/design` (components, styles, sound, blocks,
  artwork). Apps import it; never copy markup, CSS, scripts, or images into an
  app. App-specific pieces stay in the app.
- **No hardcoded colors.** Use the tokens in `packages/design/styles/tokens.css`
  (`var(--fg)`, `var(--block)`, `--syn-*`). Literal color values belong only in
  `tokens.css` and the Shiki theme, which mirrors `--syn-*` (a test checks it).
  The page is gray; color appears only inside code and lab bench output.
- **No icons where a word works.** Status is a word, warnings escalate by rule
  weight, selection is an underline or a 1px left rule. Never: gradients, glow,
  shadows, bento grids, colored badges, emoji, a second typeface, an accent
  color for links.
- **One typeface:** Noto Sans Mono. Each app loads its own font files.
- **No duplicated assets.** Artwork lives only in `packages/design/assets`, is
  exported at the sizes it is displayed, and is used through `Art`/`gallery`
  (static imports). Images need explicit width and height; lazy-load below the
  fold.
- New artwork goes in `packages/design/assets` and is covered by its
  all-rights-reserved LICENSE.
- **Sound.** Sounds are synthesized with Web Audio in `packages/design/sound`;
  there are no audio files. Mark elements with `data-sound`, or call
  `playSound(kind)`. Never play on page load. One preference: the `rv-sound`
  cookie on `.raioviajante.com`. Respect reduced motion.
- **Character.** The avatar belongs to index headers (112px), the search
  character to the search page, the "404" sticker to every 404, the
  "work of art" sticker to empty search. The search head is never smaller than
  28px. Do not add the character anywhere else without being asked.
- **Soft blocks.** Code, terminals, diffs, callouts, tables and figures use the
  markup in `docs/blocks.md`, built by `packages/design/blocks`. Code is
  highlighted at build time with the shared theme; no stock Shiki theme.
- **Frameworks.** Shared components are React. Next.js apps render them as
  server components; Astro apps render them statically through
  `@astrojs/react` (no hydration). Interactivity comes from the shared
  `behavior` script and `data-*` attributes, not per-app React state.
- **Packages and deploys.** Every consumer of `@raioviajante/design` must have
  `../../packages/design` in its Vercel Ignored Build Step. Phase 3 adds docs
  as a consumer; the owner must apply the documented setting for dump and docs
  before deploying it.
