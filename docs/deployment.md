# Deployment

## Production topology

| Domain                  | Vercel project     | Root Directory | Framework |
| ----------------------- | ------------------ | -------------- | --------- |
| `raioviajante.com`      | `raioviajante.com` | `apps/root`    | Next.js   |
| `dump.raioviajante.com` | `dump`             | `apps/dump`    | Next.js   |
| `docs.raioviajante.com` | `docs`             | `apps/docs`    | Astro     |
| `lab.raioviajante.com`  | `lab`              | `apps/lab`     | Astro     |

- All four projects deploy from `RaioViajante/web`, production branch `main`.
- `www.raioviajante.com` redirects (308) to `raioviajante.com`.
- Domains belong to the Vercel projects, not to the Git repository. Changing a
  project's repository or Root Directory does not move its domains.
- Each project uses its app directory as Root Directory, with "Include files
  outside the Root Directory in the Build Step" enabled.
- Install and build commands use Vercel's detection. Each app's
  `vercel.json` sets only the framework and the Ignored Build Step (see
  below); settings Vercel cannot read from the repository are in the
  [owner checklist](#owner-checklist-vercel-dashboard).
- DNS for `raioviajante.com` is managed in Cloudflare.

## Build and install

All four projects build from the pnpm workspace. Vercel detects pnpm 12.8.1
from `packageManager` and installs from the root `pnpm-lock.yaml`, using the
install-script policy in the root `pnpm-workspace.yaml`. Each install covers
the whole workspace; the build then runs in the project's Root Directory.

## Configuration in the repository

Each app has an `apps/<app>/vercel.json`. Vercel reads it from the project's
Root Directory, and it takes precedence over the same setting in the dashboard.

| Key             | Value                                      | Why                                                             |
| --------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `framework`     | `nextjs` (root, dump), `astro` (docs, lab) | Pins the framework preset the table above lists                 |
| `ignoreCommand` | the command below                          | Skips builds that cannot change the app (identical in all four) |

Everything else the apps need is already in the repository: the Node version
(`engines.node` in `package.json`, `.nvmrc` locally), pnpm (`packageManager`),
install-script policy (`pnpm-workspace.yaml`), and dump's redirects and headers
(`apps/dump/next.config.mjs`). Install and build commands are deliberately not
overridden; Vercel's detection runs `pnpm install` at the workspace root and
the app's `build` script.

## Ignored Build Step

Every project skips builds for commits that do not affect it. The command runs
from the project's Root Directory and compares `VERCEL_GIT_PREVIOUS_SHA` (the
commit of the project's last successful deployment) with `HEAD`, so every
commit in a push is taken into account. Exit code `0` skips the build and `1`
builds; Vercel treats any other exit code as a failed deployment.

The check fails open: a missing, malformed, or unresolvable previous SHA, or a
`git diff` error, ends in `|| exit 1` and builds rather than skipping. Without
that normalization, `git cat-file` exits `128` when the previous commit is not
in Vercel's shallow clone, which fails the deployment instead of building it.

All four apps consume `@raioviajante/design`, so every `ignoreCommand` watches
`../../packages/design`. The command is identical in all four files. It uses a
short form so that it stays within Vercel's 256-character limit for this
setting (it is 239 characters):

```sh
p=$VERCEL_GIT_PREVIOUS_SHA; printf %s "$p" | grep -Eq '^[0-9a-fA-F]{40}$' && git cat-file -e "$p^{commit}" && git diff --quiet "$p" HEAD -- . ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ../../packages/design || exit 1
```

The paths cover:

- `.` — changes inside the app's own directory.
- `../../package.json` — root workspace scripts and package-manager metadata.
- `../../pnpm-lock.yaml` — dependency changes, which may affect any app.
- `../../pnpm-workspace.yaml` — workspace membership and install-script policy.
- `../../packages/design` — the shared package all four apps consume.

Changes only under `docs/`, other apps or the root README skip every project
that they do not touch. When another app starts consuming a shared package,
add the package's path to every consumer's `ignoreCommand` first, so a shared
change can never skip one of its consumers.

### Verification

The command was run locally in a scratch clone with `VERCEL_GIT_PREVIOUS_SHA`
set, once per app (`sh -c` from `apps/<app>`):

| Change since the previous SHA                             | root                 | dump  | docs  | lab   |
| --------------------------------------------------------- | -------------------- | ----- | ----- | ----- |
| nothing                                                   | skip                 | skip  | skip  | skip  |
| only `apps/docs`                                          | skip                 | skip  | build | skip  |
| `apps/docs` and `apps/lab`, two commits                   | skip                 | skip  | build | build |
| only `apps/root`                                          | build                | skip  | skip  | skip  |
| only `apps/dump`                                          | skip                 | build | skip  | skip  |
| `packages/design`                                         | build                | build | build | build |
| only `docs/` and `README.md`                              | skip                 | skip  | skip  | skip  |
| `pnpm-lock.yaml`, `pnpm-workspace.yaml` or `package.json` | build                | build | build | build |
| an app commit followed by a `docs/`-only commit           | only that app builds |       |       |       |
| empty, malformed or unknown previous SHA                  | build                | build | build | build |

This simulates Vercel's variables; it does not prove how the dashboard
evaluates the setting. Confirm it on the first deployments after merging.

## Environment

Environment variables cannot be declared in `vercel.json`, so they live in
the dashboard (see the checklist). dump uses `NEXT_PUBLIC_SITE_URL` in the
Production environment to set its canonical origin (see
[development](development.md#environment-variables)); without it dump falls
back to `VERCEL_PROJECT_PRODUCTION_URL`. docs uses `VERCEL_DEEP_CLONE=true` so
git-based last-updated dates remain available. Explicit
`lastUpdated: "YYYY-MM-DD"` frontmatter takes precedence; dates are omitted
when neither source is available. Neither setting has been applied or
verified by the migration agent. Root and lab do not use custom environment
variables.

## Owner checklist (Vercel dashboard)

Only what cannot live in the repository. Screen names follow the Vercel
dashboard as last documented; they may have moved slightly. Nothing here has
been applied or verified by the migration agent.

For every project (`raioviajante.com`, `dump`, `docs`, `lab`):

1. **Root Directory.** Project → Settings → Build and Deployment → Root
   Directory: `apps/root`, `apps/dump`, `apps/docs`, `apps/lab` as in the
   topology table. `vercel.json` is only read from this directory.
2. **Include files outside the Root Directory.** Same screen, same section,
   the checkbox "Include files outside of the Root Directory in the Build
   Step": enabled. The workspace install and the social cards need
   `packages/design` and the root lockfile.
3. **Production branch.** Project → Settings → Git (or Environments →
   Production → Branch Tracking): `main`.
4. **Domains.** Project → Settings → Domains: the domain from the topology
   table, and for `raioviajante.com` the `www.raioviajante.com` redirect (308)
   to `raioviajante.com`. DNS stays in Cloudflare.
5. **Clear the old Ignored Build Step (optional).** Project → Settings → Build
   and Deployment → Ignored Build Step: if a command was set by hand, set it
   back to the default (Automatic) so the repository is the only source. It is
   overridden by `vercel.json` either way.

Per project:

6. **docs: `VERCEL_DEEP_CLONE=true`.** `docs` → Settings → Environment
   Variables → add `VERCEL_DEEP_CLONE` = `true` for Production and Preview.
   Without it Vercel's shallow clone hides git history and the last-updated
   dates are omitted.
7. **dump: `NEXT_PUBLIC_SITE_URL`.** `dump` → Settings → Environment
   Variables → keep `NEXT_PUBLIC_SITE_URL` = `https://dump.raioviajante.com`
   for Production (Preview may be left unset).

After the first deployments of the migration:

8. **Verify.** Check each site's sitemap, robots, social images, host 404,
   cross-origin search index, the icons and manifest, and that a commit
   touching only `packages/design` rebuilds all four projects while a commit
   touching only `apps/docs` rebuilds only docs (Project → Deployments shows
   "Canceled by Ignored Build Step" for the others).

## Shared packages

`packages/design` (`@raioviajante/design`) is consumed by all four apps.
A commit that changes only `packages/design` rebuilds all four apps, because
every `ignoreCommand` watches it.

## Metadata build assets

Social PNGs are generated at build time using shared fonts, artwork and tokens.
Keep "Include files outside the Root Directory" enabled for all projects.
There is no external image service or new secret. After deploying, verify each
site’s sitemap, robots, social images, host 404 and cross-origin search index.
No deployment is implied by local validation.
