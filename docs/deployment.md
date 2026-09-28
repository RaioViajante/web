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

## Ignored Build Step

Every project skips builds for commits that do not affect it. The command runs
from the project's Root Directory, so `.` is the app directory. Exit code `1`
builds; `0` skips.

**Currently configured on all four projects:**

```sh
git diff HEAD^ HEAD --quiet -- .
```

**Required before the pnpm workspace reaches production.** The workspace moves
install configuration to the repository root, so root-level changes must also
trigger builds:

```sh
git diff HEAD^ HEAD --quiet -- . ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml
```

At the time of writing, production still runs the layout from before the
workspace, where each app had its own lockfile. Rolling out the workspace also
changes each project's package manager, which should be confirmed with preview
deployments before `main` moves:

| Project            | Before the workspace | With the workspace |
| ------------------ | -------------------- | ------------------ |
| `raioviajante.com` | pnpm 12.4.1          | pnpm 12.4.1        |
| `dump`             | npm                  | pnpm 12.4.1        |
| `docs`             | pnpm 10              | pnpm 12.4.1        |
| `lab`              | pnpm 10              | pnpm 12.4.1        |

## Environment

dump uses `NEXT_PUBLIC_SITE_URL` in the Production environment to set its
canonical origin (see [development](development.md#environment-variables)).
The other apps do not use custom environment variables.

## Shared packages

No shared packages exist yet. When an app starts consuming code from a future
`packages/` directory, that app's Ignored Build Step must also list the shared
paths it depends on, so a shared change rebuilds every consumer.
