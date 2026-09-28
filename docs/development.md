# Development

## Requirements

- Node.js 24.20.0, pinned in [`.nvmrc`](../.nvmrc). The workspace requires
  Node 24 (`engines`).
- pnpm 12.4.1, pinned through `packageManager` in the root
  [`package.json`](../package.json) and in each app's `package.json`.

## Install

From the repository root:

```sh
pnpm install
```

This installs every app from the single root `pnpm-lock.yaml`.

## Run an application

```sh
pnpm --filter @raioviajante/root dev
pnpm --filter @raioviajante/dump dev
pnpm --filter @raioviajante/docs dev
pnpm --filter @raioviajante/lab dev
```

The Next.js apps (root, dump) and the Astro apps (docs, lab) use the same default
ports within each framework, so running several at once needs explicit ports.
There is no root command that starts every app.

Any app script can be run the same way, for example
`pnpm --filter @raioviajante/dump test`. Running scripts from inside an app
directory also works.

## Validate

```sh
pnpm validate
```

This runs `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and
`pnpm build` in order. Each root script runs only in the apps that define it:

| App  | format:check | lint | typecheck | test | build |
| ---- | :----------: | :--: | :-------: | :--: | :---: |
| root |      ✓       |  ✓   |     ✓     |      |   ✓   |
| dump |      ✓       |  ✓   |     ✓     |  ✓   |   ✓   |
| docs |              |      |     ✓     |      |   ✓   |
| lab  |      ✓       |  ✓   |     ✓     |      |   ✓   |

docs and lab run `typecheck` through `astro check`. CI runs the same install
and `pnpm validate` on pull requests and pushes to `main`
([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).

## Environment variables

Only dump reads environment variables.

`NEXT_PUBLIC_SITE_URL` is public configuration, not a secret. It sets dump's
canonical origin, which feeds canonical links, Open Graph URLs, the RSS feed,
and the sitemap. Production sets it to `https://dump.raioviajante.com`.

When it is unset, `apps/dump/lib/site.ts` falls back to Vercel's
`VERCEL_PROJECT_PRODUCTION_URL`, and then to `http://localhost:3000` for local
development. To reproduce production URLs locally:

```sh
NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm --filter @raioviajante/dump build
```

## Package management

- pnpm only. Do not add `package-lock.json` or `yarn.lock` files; CI rejects them.
- One root `pnpm-lock.yaml`; apps do not have their own lockfiles.
- Apps declare their own dependencies. Versions do not need to match across apps.
- Dependency upgrades are intentional and scoped to the app that needs them.
- Packages that run install scripts are listed under `allowBuilds` in
  `pnpm-workspace.yaml`; pnpm fails installs for unlisted ones.

## Generated output

Not committed, and not edited by hand:

- `node_modules/`
- `.next/` and `next-env.d.ts` (root, dump)
- `dist/` and `.astro/` (docs, lab)
- `*.tsbuildinfo`
