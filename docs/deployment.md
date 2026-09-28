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

All four projects build from the pnpm workspace. Vercel detects pnpm 12.4.1
from `packageManager` and installs from the root `pnpm-lock.yaml`, using the
install-script policy in the root `pnpm-workspace.yaml`. Each install covers
the whole workspace; the build then runs in the project's Root Directory.

## Ignored Build Step

Every project skips builds for commits that do not affect it. All four projects
use:

```sh
git diff HEAD^ HEAD --quiet -- . ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml
```

The command runs from the project's Root Directory. Exit code `1` builds; `0`
skips. The paths cover:

- `.` — changes inside the app's own directory.
- `../../package.json` — root workspace scripts and package-manager metadata.
- `../../pnpm-lock.yaml` — dependency changes, which may affect any app.
- `../../pnpm-workspace.yaml` — workspace membership and install-script policy.

The command compares only the latest commit with its parent, so a push of
several commits is judged by its last commit.

## Environment

dump uses `NEXT_PUBLIC_SITE_URL` in the Production environment to set its
canonical origin (see [development](development.md#environment-variables)).
The other apps do not use custom environment variables.

## Shared packages

No shared packages exist yet; there is no `packages/` directory. When an app
starts consuming code from a future shared package, that app's Ignored Build
Step must also list the shared paths it depends on, so a shared change rebuilds
every consumer.
