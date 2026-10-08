# AGENTS.md

Instructions for RaioViajante/web. App `AGENTS.md` files add local rules;
explicit task instructions take precedence. `CLAUDE.md` mirrors this file.

## Repository

| Path              | Package                | Purpose                             |
| ----------------- | ---------------------- | ----------------------------------- |
| `apps/root`       | `@raioviajante/root`   | Personal home and ecosystem index   |
| `apps/dump`       | `@raioviajante/dump`   | Technical writing                   |
| `apps/docs`       | `@raioviajante/docs`   | Curated technical documentation     |
| `apps/lab`        | `@raioviajante/lab`    | Interactive experiments             |
| `packages/design` | `@raioviajante/design` | Shared design, behavior and artwork |

- Apps deploy independently and never import one another. Packages never import
  apps. Repository docs live in `docs/`; app maintenance docs in `apps/*/docs/`.
- Beside the apps: `site/` (origins and contact constants, imports nothing),
  `seo/` (metadata, sitemap, robots, manifest, JSON-LD) and `security/` (headers,
  security.txt, verification) import `site/`, never an app; `packages/design`
  may import `site/`. No re-export shims. See `docs/architecture.md`.
- Use English for repository content, identifiers, comments, commits and GitHub
  metadata. Do not rewrite unrelated existing content just to enforce this.
- Inspect relevant code and docs before editing. Preserve unrelated owner edits.
- pnpm 12.8.1 only, Node 24 from `.nvmrc`. One workspace and root lockfile;
  change the lockfile only through pnpm. Prefer named filters from the root.
- Scope dependency changes to the task. Do not unify intentional version
  differences. Packages with install scripts need workspace `allowBuilds` entries.

## Shared design

Read `docs/design-system.md` and `docs/blocks.md` for the implemented contract.

- Every repeated component, style, behavior, sound and artwork has one
  implementation in `packages/design`. Apps own routes, content and unique
  interactions. Play does not automatically inherit this system.
- All four apps load `@raioviajante/design/styles.css`. Colors come from
  `styles/tokens.css`; literals belong only there and in the tested Shiki mirror.
  Page chrome is gray; color belongs inside code and lab output.
- One typeface: self-hosted Noto Sans Mono, preloaded by each app. Social cards
  use the shared renderer and token colors. Never copy a renderer into an app.
- Use words for status, warnings and controls. No decorative icons, gradients,
  glow, colored badges, emoji, bento grids or second typeface. Preserve the
  documented root gallery effects; do not add shadows elsewhere.
- Artwork lives once in `packages/design/assets`, with its all-rights-reserved
  license. Use `Art`/gallery static imports, meaningful alt text (empty for
  decorative images), explicit dimensions and lazy loading below the fold.
- Site icons are generated from `assets/icons/source.png` with
  `pnpm --filter @raioviajante/design icons`; never edit the app copies. The
  search illustration is derived from `assets/search/source/` with
  `pnpm --filter @raioviajante/design search-art`.
- The avatar belongs on index headers and social cards; the search character
  belongs on search, the 404 sticker on 404, and the empty-search sticker on
  empty results. Search heads are at least 28px. Other placements need a task.
- Soft blocks use the shared markup and build-time custom Shiki theme.
- Next.js renders shared React on the server. Astro uses `@astrojs/react`
  statically: no `client:*` or browser React. Shared `behavior` handles common
  interactions; lab benches use small plain TypeScript Astro scripts.
- Web Audio synthesis lives in `packages/design/sound`; no audio files or sound
  on load. Use `data-sound` / `playSound`, one `rv-sound` cookie on
  `.raioviajante.com`, and respect reduced motion.
- Keep one h1, semantic landmarks, visible keyboard focus, 44px standalone
  controls, 4.5:1 text contrast and live feedback. Inline prose links retain
  natural text flow. Outcomes must remain clear without color or sound.
- Never publish placeholders or invent dates, versions, permissions or legal
  facts. Omit unknown facts and record them in the report. Preserve source
  placeholders in historical briefs. Document implemented and planned work honestly.

## Branches and staging

The design migration is complete; `docs/design-migration-plan.md` is a historical
record, not instructions. Work on the branch the task names, and inspect the
current Git state (branch, status, recent log) before changing anything. Stage
explicit files or hunks; never `git add -A` or `git add .`. Preserve unrelated
uncommitted edits, including playground edits.

## Validation and Git

| Package | Scripts with `pnpm --filter @raioviajante/<package>` |
| ------- | ---------------------------------------------------- |
| root    | `format:check`, `lint`, `typecheck`, `build`         |
| dump    | `format:check`, `lint`, `typecheck`, `test`, `build` |
| docs    | `typecheck`, `test`, `build`                         |
| lab     | `format:check`, `lint`, `typecheck`, `test`, `build` |
| design  | `format:check`, `typecheck`, `test`                  |

Docs has no lint or format scripts. Shared/workspace changes require:

```sh
NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate
```

For UI changes, check desktop/mobile, keyboard, focus, overflow and relevant
interactions. Report only checks actually run. Use Conventional Commits in
English (CI checks them with commitlint; try `pnpm commits:check`); review
staged diffs and commit meaningful validated progress.
Never push without explicit authorization or rewrite imported history/tags
(`import/root`, `import/dump`, `import/docs`, `import/lab`).

## Production and generated files

- See `docs/deployment.md`: four Vercel projects, Root Directory `apps/<app>`.
  Each app's `vercel.json` holds its framework and Ignored Build Step
  (`security/vercel-ignore.mjs`), which must keep watching the shared paths
  listed there. Dashboard settings, domains and environment (dump
  `NEXT_PUBLIC_SITE_URL`) are infrastructure; change them only when explicitly
  requested. Do not claim an unverified rollout. See `docs/operations.md`.
- Never edit generated `node_modules/`, `.next/`, `dist/`, `.astro/`, coverage,
  `*.tsbuildinfo` or framework-generated `next-env.d.ts` by hand.
- Root/docs/lab have app rules. Dump's framework-generated `AGENTS.md` and
  `CLAUDE.md` remain intentionally gitignored.
