# raioviajante.com

The root of the RaioViajante internet identity: a personal home directory on the
internet. It is not intended to be a portfolio, résumé, or sales landing page.

## Scope

Internal routes:

- `/` — home
- `/setup` — personal gear
- `/about` — personal introduction
- `/projects` — projects
- `/contact` — contact email and message guidance
- `/gallery` — animated collection of original character art
- `/this-site` — notes on the site and its source code
- `/search` — search across this site and the other RaioViajante sites
- `/privacy` — privacy information for the root site
- `/terms` — terms of use for the root site

Related independent websites:

- [dump.raioviajante.com](https://dump.raioviajante.com)
- [lab.raioviajante.com](https://lab.raioviajante.com)
- [docs.raioviajante.com](https://docs.raioviajante.com)

These external websites must not become local routes.

## Status and stack

The shared design system is implemented across all root routes,
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
