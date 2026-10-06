# @raioviajante/design

The shared design system for raioviajante.com, dump, docs and lab: tokens,
styles, artwork, sound, soft blocks and the React components that build the
shared frame. Private, no build step; apps import the source.

Rules and the full spec: [docs/design-system.md](../../docs/design-system.md)
and [docs/blocks.md](../../docs/blocks.md). Migration status:
[docs/design-migration-plan.md](../../docs/design-migration-plan.md).

## Layout

```text
styles/      tokens.css, base.css, blocks.css (styles.css imports all three)
assets/      character/, stickers/, search/ (search/head/ frames + sprite), gallery/
sound/       Web Audio synthesis, sound map, shared preference, player
blocks/      Shiki theme, highlighting, markup builder, rehype/remark plugins, client behavior
components/  Shell, page parts, soft blocks, lab bench, legal and 404 templates
behavior.ts  one client script: sound toggle, block behavior, 404 path
```

The older `tokens.css`, `editorial-tokens.css`, `editorial.css` and
`editorial-sound` entries stay until the apps move to the files above; the
migration plan lists them for removal.

## Use

```ts
import "@raioviajante/design/styles.css"; // tokens + base + blocks
import {
  Shell,
  PageHeader,
  Section,
  LeaderRow,
} from "@raioviajante/design/components";
```

- **Next.js**: render `<Behavior />` from `@raioviajante/design/behavior-react`
  once in the layout. Components are server components.
- **Astro**: render components with `@astrojs/react` (static, no hydration) and
  run the behavior from a script:
  `import { startBehavior } from "@raioviajante/design/behavior"; startBehavior();`
- **Markdown/MDX**: `remark-directive`, then `remarkSoftCallouts` and
  `rehypeSoftBlocks` from `@raioviajante/design/blocks` (fence syntax in
  [docs/blocks.md](../../docs/blocks.md)).
- **Sound**: add `data-sound="nav"` (and the kinds in `sound/events.ts`) to
  elements; call `playSound("success")` for events without an element. Nothing
  plays on load.
- **Artwork**: `<Art name="avatar" alt="…" />`; gallery images come from
  `@raioviajante/design/gallery`. Never copy files into an app.

## Shared sound preference

The preference is the `rv-sound` cookie on `.raioviajante.com`. The old
`rv-sound` localStorage value (root, dump) is migrated on first read.

## Checks

```sh
pnpm --filter @raioviajante/design format:check
pnpm --filter @raioviajante/design typecheck
pnpm --filter @raioviajante/design test
```

## Deployment

An app that consumes this package needs `../../packages/design` in its Vercel
Ignored Build Step. See [docs/deployment.md](../../docs/deployment.md).
