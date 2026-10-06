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

| App  | Framework                        |
| ---- | -------------------------------- |
| root | Next.js (App Router)             |
| dump | Next.js (App Router) with MDX    |
| docs | Astro (plain content collection) |
| lab  | Astro                            |

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
└── design/    @raioviajante/design — design system: tokens, styles, artwork, sound, blocks, components
```

An app depends on a package through `workspace:*` and imports it through the
package's `exports`, never by a relative path into `packages/`.

## Shared design policy

All four apps consume the shared design system in `@raioviajante/design`.
The package contains tokens and styles, artwork, Web Audio sound, static React
components, soft-block highlighting and markup, and browser behavior. Every
shared piece has one implementation. Apps own their font loading, routes,
content and experiment-specific behavior.

Next.js apps render the components on the server; Astro apps render through
`@astrojs/react` at build time with no hydration. Shared `behavior` handles
sound, search, avatar animation and block controls. Lab enhances its benches
with small plain TypeScript Astro scripts and shares pure logic with Node tests.

`styles.css` replaces the legacy color primitives and editorial shell entries.
Those old exports remain until Phase 6 verifies and removes obsolete code. No
app loads both style systems. Migration status and remaining work are tracked
in [design-migration-plan](design-migration-plan.md); rules are in
[design-system](design-system.md) and [blocks](blocks.md).

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
