# Architecture

## Monorepo model

RaioViajante/web holds independently deployable web applications that share
repository infrastructure: one pnpm workspace, one lockfile, one CI workflow,
and common conventions. It is not a single application split into parts; each
app has its own purpose, framework, and production deployment.

## Applications

- **`apps/root`** — the personal home of the ecosystem at `raioviajante.com`:
  a small index of who, what is being built, and where the other sites are.
- **`apps/dump`** — personal technical writing: posts authored as MDX, with an
  archive, tags, RSS feed, and comments.
- **`apps/docs`** — curated public technical documentation for projects and
  systems, with search.
- **`apps/lab`** — interactive experiments and prototypes inside a consistent
  site shell.

The sites link to one another by their full URLs. None of them implements
another site as a local route.

## Isolation

- Apps do not import from one another.
- Each app owns its framework configuration, linting, formatting, TypeScript
  settings, and build output.
- Each app is built and deployed on its own; a change to one app does not
  require changes to another.
- Code moves out of an app only when there is a real shared responsibility
  with more than one consumer.

## Frameworks

| App  | Framework                     |
| ---- | ----------------------------- |
| root | Next.js (App Router)          |
| dump | Next.js (App Router) with MDX |
| docs | Astro with Starlight          |
| lab  | Astro                         |

The split follows what each site needs. There is no goal of converging on one
framework.

## Shared packages

Shared code lives in `packages/`, with one allowed direction:

```text
apps/* ──depends on──▶ packages/*
packages/* never depend on apps/*
```

```text
packages/
└── design/    @raioviajante/design — color and editorial design CSS
```

An app depends on a package through `workspace:*` and imports it through the
package's `exports`, never by a relative path into `packages/`.

## Shared design policy

root, dump, docs, and lab share the broader RaioViajante visual identity. Each
app implements that identity itself; shared implementation is extracted only
where there is genuine reuse.

`@raioviajante/design` is a private, framework-neutral package of static CSS
with no build step. It exports `./tokens.css`, which defines five color
primitives for the light and dark themes:

- `--rv-color-bg`
- `--rv-color-fg`
- `--rv-color-accent`
- `--rv-color-muted`
- `--rv-color-hairline`

It also exports `./editorial-tokens.css`, the framework-neutral specification
for the root site's current editorial colors, Noto Sans Mono typography,
layout measures, and interaction timing. `./editorial.css` imports those tokens
and provides structural selectors for the top line, navigation, content grid,
sections, rows, and footer. Root currently consumes the shell; dump, docs, and
lab have not migrated to the editorial tokens or shell yet. Apps supply their
own font loading, routes, and page content.

An app using the color primitives keeps its own variable names and points them
at the primitives:

```text
app CSS ──▶ app semantic aliases (e.g. --bg) ──▶ --rv-color-* primitives
```

Apps that have not adopted the editorial shell retain their own selectors,
typography, layout, and theme behavior.

| App  | Consumes `@raioviajante/design` |
| ---- | ------------------------------- |
| root | yes                             |
| lab  | yes                             |
| dump | no                              |
| docs | no                              |

Each consumer documents its own mapping: see root's
[design notes](../apps/root/docs/design.md) and lab's
[design notes](../apps/lab/docs/design.md).

Play is intentionally allowed its own visual identity. When it joins the
repository, it must not automatically inherit the shared RaioViajante design
package.

## Workspace

- One pnpm workspace (`pnpm-workspace.yaml`) covering `apps/*` and
  `packages/*`.
- One root `pnpm-lock.yaml` for every app.
- Each app remains a separate package (`@raioviajante/<app>`) with its own
  dependency declarations. Versions of the same dependency may intentionally
  differ between apps.

## Deployment topology

One Git repository feeds four Vercel projects. Each project builds only its own
app directory:

```text
RaioViajante/web (main)
├── apps/root ──▶ Vercel project raioviajante.com ──▶ raioviajante.com
├── apps/dump ──▶ Vercel project dump             ──▶ dump.raioviajante.com
├── apps/docs ──▶ Vercel project docs             ──▶ docs.raioviajante.com
└── apps/lab  ──▶ Vercel project lab              ──▶ lab.raioviajante.com
```

See [deployment](deployment.md) for the operational details.
