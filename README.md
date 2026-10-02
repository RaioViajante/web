# RaioViajante Web

This repository contains the web applications that make up the RaioViajante
internet ecosystem. Each application is developed, validated, and deployed
independently; they share only repository infrastructure.

## Applications

| Path        | Package              | Role                                     | Stack             | Production                                             |
| ----------- | -------------------- | ---------------------------------------- | ----------------- | ------------------------------------------------------ |
| `apps/root` | `@raioviajante/root` | personal home and index of the ecosystem | Next.js           | [raioviajante.com](https://raioviajante.com)           |
| `apps/dump` | `@raioviajante/dump` | personal technical writing               | Next.js + MDX     | [dump.raioviajante.com](https://dump.raioviajante.com) |
| `apps/docs` | `@raioviajante/docs` | curated public technical documentation   | Astro + Starlight | [docs.raioviajante.com](https://docs.raioviajante.com) |
| `apps/lab`  | `@raioviajante/lab`  | interactive experiments                  | Astro             | [lab.raioviajante.com](https://lab.raioviajante.com)   |

Each app keeps its own README and `docs/` directory for app-specific details.

## Repository structure

```text
.
├── apps/
│   ├── root/
│   ├── dump/
│   ├── docs/
│   └── lab/
├── docs/                 repository-level documentation
├── .github/workflows/    CI
├── package.json          workspace scripts
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

Play, a separate project, is planned to live under `apps/play` once its
implementation begins. It is not part of this repository today.

## Requirements

- Node.js 24 (the exact version is pinned in [`.nvmrc`](.nvmrc))
- pnpm 12.8.1 (pinned through `packageManager` in [`package.json`](package.json))

## Getting started

```sh
pnpm install
```

Run one application at a time with a named filter:

```sh
pnpm --filter @raioviajante/root dev
pnpm --filter @raioviajante/dump dev
pnpm --filter @raioviajante/docs dev
pnpm --filter @raioviajante/lab dev
```

The Next.js apps and the Astro apps each share a default development port, so
starting several apps at once requires choosing different ports.

## Validation

```sh
pnpm validate
```

`validate` runs the following root scripts in order. Each one runs only in the
apps that define the corresponding script:

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

See [development](docs/development.md) for what each app validates.

## Deployment

Each app is deployed as a separate Vercel project from this repository's `main`
branch, using its app directory as the project's Root Directory. See
[deployment](docs/deployment.md).

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Deployment](docs/deployment.md)
- [Repository history](docs/repository-history.md)
