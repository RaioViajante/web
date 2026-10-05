# Shared design CSS

`@raioviajante/design` exposes two visual systems during the site migration:

- `tokens.css` contains the existing light and dark color primitives used by Lab.
- `editorial-tokens.css` contains the root site's current editorial colors,
  Noto Sans Mono font specification, type scale, layout measures, and interaction
  timing. It defines custom properties only, so Astro and Next.js can both use it.
- `editorial.css` imports `editorial-tokens.css` and provides the existing
  `.rv-shell` layout and interaction selectors. Root and Dump consume it.
- `editorial-sound` provides the Root and Dump sound palette and interaction
  event handling for links and buttons marked with `data-sound`. Inputs marked
  with `data-sound="typing"` play a quiet key sound while sound is enabled.

An app that only needs editorial values imports
`@raioviajante/design/editorial-tokens.css`. An app using the complete shell
imports `@raioviajante/design/editorial.css`; it does not need to import the
tokens separately. The app remains responsible for loading Noto Sans Mono and
for its own routes, content, and app-specific interactions. The root site loads
the font through `next/font`.

The shared shell handles hover, keyboard focus, and reduced motion for its own
selectors. An app introducing additional animations must handle reduced motion
in its own styles or components.

Docs does not consume this package yet. Before it imports the package, update
its Vercel project's Ignored Build Step to watch `../../packages/design`.
