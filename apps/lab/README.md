# lab.raioviajante.com

The experimental part of the RaioViajante internet identity: experiments, prototypes, and technical curiosities that haven't decided what they are yet.

## Ecosystem

- [raioviajante.com](https://raioviajante.com) — identity / personal index
- [dump.raioviajante.com](https://dump.raioviajante.com) — writing and thoughts
- [docs.raioviajante.com](https://docs.raioviajante.com) — stable public technical documentation
- **lab.raioviajante.com** — experiments (this app)

Core rule: **the shell is consistent, the experiments are allowed to misbehave.**

## Stack

Astro, TypeScript, pnpm. Static-first, no UI framework.

## Local development

```sh
pnpm install
pnpm dev
```

See [development](docs/development.md) for the full command list and manual verification checklist.

## Visual reference

The approved Claude Design export was kept locally at `reference/claude-export/`. It is excluded via `.gitignore` and is not part of the monorepo checkout. Where it is available, it is read-only visual reference material: do not modify, move, format, or commit it.

## Documentation

- [Agent instructions](AGENTS.md)
- [Architecture](docs/architecture.md)
- [Design](docs/design.md)
- [Content](docs/content.md)
- [Development](docs/development.md)
- [Deployment](docs/deployment.md)
