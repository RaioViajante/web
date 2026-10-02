# raioviajante.com

The root of the RaioViajante internet identity: a personal home directory on the
internet. It is not intended to be a portfolio, résumé, or sales landing page.

## Scope

Internal routes:

- `/` — home
- `/projects` — projects
- `/now` — current activities

Related independent websites:

- [dump.raioviajante.com](https://dump.raioviajante.com)
- [lab.raioviajante.com](https://lab.raioviajante.com)
- [docs.raioviajante.com](https://docs.raioviajante.com)

These external websites must not become local routes.

## Status and stack

The approved interface is implemented across `/`, `/projects`, and `/now`,
sharing a common layout, header, and footer. The stack is Next.js (App
Router), React, TypeScript, pnpm, ESLint, and Prettier, ready to deploy to
Vercel at https://raioviajante.com. See [deployment](docs/deployment.md) for
details.

## Local development

Use Node.js 24 or newer and pnpm 12.8.1.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. See [development](docs/development.md) for validation
and production commands.

## Visual reference

The approved Claude Design reference is identified in the project brief as
`/refence/claude-export/` and was kept locally at `reference/claude-export/`.
It is not tracked in Git and is not part of the monorepo checkout. Where it is
available, it is read-only visual reference material: do not modify, move,
rename, delete, or build inside it.

## Documentation

- [Agent instructions](AGENTS.md)
- [Architecture](docs/architecture.md)
- [Design](docs/design.md)
- [Development](docs/development.md)
- [Deployment](docs/deployment.md)
