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
- Framework, install, and build settings use Vercel's detection; there is no
  `vercel.json`.
- DNS for `raioviajante.com` is managed in Cloudflare.

## Build and install

All four projects build from the pnpm workspace. Vercel detects pnpm 12.8.1
from `packageManager` and installs from the root `pnpm-lock.yaml`, using the
install-script policy in the root `pnpm-workspace.yaml`. Each install covers
the whole workspace; the build then runs in the project's Root Directory.

## Ignored Build Step

Every project skips builds for commits that do not affect it. The command runs
from the project's Root Directory and compares `VERCEL_GIT_PREVIOUS_SHA` (the
commit of the project's last successful deployment) with `HEAD`, so every
commit in a push is taken into account. Exit code `0` skips the build; any
other exit code builds.

The check fails open: a missing, malformed, or unresolvable previous SHA, or a
`git diff` error, exits non-zero and builds rather than skipping.

All four apps consume `@raioviajante/design`, so their Ignored Build Step must
watch `../../packages/design`. Root and lab already do. The owner still needs
to apply the command below to dump and docs in Vercel before deploying Phase 3.
It uses a shorter, equivalent form so that it stays
within Vercel's 256-character limit for this setting:

```sh
p=$VERCEL_GIT_PREVIOUS_SHA; printf %s "$p" | grep -Eq '^[0-9a-fA-F]{40}$' && git cat-file -e "$p^{commit}" && git diff --quiet "$p" HEAD -- . ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ../../packages/design
```

The paths cover:

- `.` — changes inside the app's own directory.
- `../../package.json` — root workspace scripts and package-manager metadata.
- `../../pnpm-lock.yaml` — dependency changes, which may affect any app.
- `../../pnpm-workspace.yaml` — workspace membership and install-script policy.
- `../../packages/design` (all four apps) — the shared package they consume.

## Environment

dump uses `NEXT_PUBLIC_SITE_URL` in the Production environment to set its
canonical origin (see [development](development.md#environment-variables)).
The other apps do not use custom environment variables.

## Shared packages

`packages/design` (`@raioviajante/design`) is consumed by all four apps.
After the owner updates the dump and docs Vercel settings, a commit that
changes only `packages/design` will rebuild all four apps.

Before another app starts consuming a shared package, add that package's path
to the app's Ignored Build Step first, so a shared change can never skip one of
its consumers.
