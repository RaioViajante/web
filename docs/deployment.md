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
  `vercel.json` sets the framework and the Ignored Build Step (see
  below), plus security headers for static Astro apps; settings Vercel cannot read from the repository are in the
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
| `ignoreCommand` | `node ../../security/vercel-ignore.mjs`    | Skips builds that cannot change the app (identical in all four) |

Everything else the apps need is already in the repository: the Node version
(`engines.node` in `package.json`, `.nvmrc` locally), pnpm (`packageManager`),
install-script policy (`pnpm-workspace.yaml`), and dump's redirects and headers
(`apps/dump/next.config.mjs`). Install and build commands are deliberately not
overridden; Vercel's detection runs `pnpm install` at the workspace root and
the app's `build` script.

## Ignored Build Step

Every project skips builds for commits that do not affect it. Each
`vercel.json` holds the same short command, and the logic lives in one tested
script:

```json
"ignoreCommand": "node ../../security/vercel-ignore.mjs"
```

This is Vercel's "Run my Node script" form. Vercel runs the command in the
project's Root Directory (`apps/<app>`) and reads the exit code: `1` continues
the build and `0` cancels it ([project settings](https://vercel.com/docs/project-configuration/project-settings#ignored-build-step)).
The script is named after that: it returns **1 to build, 0 to skip**. It needs
only Node and git, because it runs before dependencies are installed.

`security/vercel-ignore.mjs` works out the app from the working directory
(`apps/<name>` only) and compares `VERCEL_GIT_PREVIOUS_SHA` (the commit of the
project's last successful deployment) with `HEAD`, so every commit in a push is
taken into account. It skips only when `git diff --quiet` proves nothing changed
in:

- `apps/<app>`: the app itself, and no other app;
- `package.json`: workspace scripts and package-manager metadata;
- `pnpm-*`: the lockfile (dependencies) and the workspace file (membership and install-script policy);
- `packages/design`: the shared package all four apps consume;
- `security`: header builders, security.txt, and the ignore script itself, so changing the rule rebuilds everything;
- `seo`: shared metadata, sitemap, robots and manifest helpers, `SeoHead`, and JSON-LD builders;
- `site`: the canonical origins and contact constants.

Everything else fails open to **build**: a missing, malformed or unknown
previous SHA, a previous commit that is not in Vercel's clone (shallow clones
are common), an unrecognizable working directory, or a `git diff` error. A
skipped deployment is the costly mistake, so anything the script cannot trust
builds. There is no command-length limit to manage: add a shared path to
`sharedPaths` in the script, and `security/vercel-ignore.test.mjs` proves each
path rebuilds every app.

Changes only under `docs/`, other apps or the root README skip every project
that they do not touch. When another app starts consuming a shared package or
folder, add its path to `sharedPaths` first, so a shared change can never skip
one of its consumers.

Other documentation: [security-headers.md](security-headers.md),
[security-txt.md](security-txt.md), [privacy-storage.md](privacy-storage.md),
[network-origins.md](network-origins.md), [seo.md](seo.md),
[browser-checks.md](browser-checks.md), [performance.md](performance.md),
[links.md](links.md), [ci.md](ci.md) and
[security-maintenance.md](security-maintenance.md). Astro header literals are
generated with `node security/sync-vercel.mjs` and checked by
`pnpm security:check`.

### Verification

`security/vercel-ignore.test.mjs` runs the real script in throwaway git
repositories shaped like this one: a change in one app builds only that app;
each shared path builds all four; unrelated paths and no change skip; and an
absent, empty, malformed, injected-looking or unknown previous SHA, a git
failure or a wrong working directory all build. The old inline command was
compared with the script over 13 previous commits (including a zero and a
malformed SHA) for all four apps with identical results.

This proves the script, not how Vercel's dashboard evaluates the setting; that
is confirmed on real deployments, recorded in [operations.md](operations.md).

## Environment

Environment variables cannot be declared in `vercel.json`, so they live in
the dashboard (see the checklist). dump uses `NEXT_PUBLIC_SITE_URL` in the
Production environment to set its canonical origin (see
[development](development.md#environment-variables)); without it dump falls
back to `VERCEL_PROJECT_PRODUCTION_URL`. docs no longer needs
`VERCEL_DEEP_CLONE`: its "last updated" dates come only from explicit
`lastUpdated: "YYYY-MM-DD"` frontmatter, never from git history, and are
omitted without it. Root and lab do not use custom environment variables.
Dashboard values cannot be read from the repository; whether they have been
checked is recorded in [operations.md](operations.md).

## Owner checklist (Vercel dashboard)

Only what cannot live in the repository. Screen names follow the Vercel
dashboard as last documented; they may have moved slightly. The current
production state of these settings is recorded in
[operations.md](operations.md).

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

6. **docs: `VERCEL_DEEP_CLONE`.** No longer required. Earlier versions read git
   history for a last-updated date; docs now uses only explicit `lastUpdated`
   frontmatter. If the variable is already set it is harmless and can stay.
7. **dump: `NEXT_PUBLIC_SITE_URL`.** `dump` → Settings → Environment
   Variables → keep `NEXT_PUBLIC_SITE_URL` = `https://dump.raioviajante.com`
   for Production (Preview may be left unset).

After changing any of these settings, or setting up a new project:

8. **Verify.** Check each site's sitemap, robots, social images, host 404,
   cross-origin search index, the icons and manifest, and that a commit
   touching only `packages/design` rebuilds all four projects while a commit
   touching only `apps/docs` rebuilds only docs (Project → Deployments shows
   "Canceled by Ignored Build Step" for the others).

## Shared packages

`packages/design` (`@raioviajante/design`) is consumed by all four apps.
A commit that changes only `packages/design` rebuilds all four apps, because
the Ignored Build Step watches it.

## Metadata build assets

Social PNGs are generated at build time using shared fonts, artwork and tokens.
Keep "Include files outside the Root Directory" enabled for all projects.
There is no external image service or new secret. After deploying, verify each
site’s sitemap, robots, social images, host 404 and cross-origin search index.
No deployment is implied by local validation.
