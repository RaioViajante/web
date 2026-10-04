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

The editorial interface is implemented across `/`, `/projects`, and `/now`,
sharing a common layout, navigation, and footer. The stack is Next.js (App
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

The current editorial design is inspired by [bero.land](https://bero.land).
The original character, site content, and responsive implementation belong to
RaioViajante. The older Claude Design reference remains locally in the
untracked `reference/claude-export/` directory as historical material.

## Documentation

- [Agent instructions](AGENTS.md)
- [Architecture](docs/architecture.md)
- [Design](docs/design.md)
- [Development](docs/development.md)
- [Deployment](docs/deployment.md)
