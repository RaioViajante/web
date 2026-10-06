# Development

## Status

The Astro application is initialized. The approved RaioViajante visual system, bespoke homepage, article navigation, table of contents, heading permalinks, fixed dark palette, and current public documentation are implemented.

## Stack

- **Package manager:** pnpm
- **Framework:** Astro
- **Documentation framework:** Astro content collection (Starlight was removed)
- **Language:** TypeScript
- **Content format:** Markdown / MDX
- **Search:** the shared client-side search over `/search-index.json`, generated at build time
- **Dependencies:** kept minimal — `astro`, the React integration, the markdown processor, the self-hosted font and the shared design package in production, `typescript` and `@astrojs/check` in development

## Commands

- `pnpm install` — install dependencies
- `pnpm dev` — start the local development server
- `pnpm build` — produce a production build in `dist/`
- `pnpm preview` — serve the production build locally
- `pnpm check` — run Astro/TypeScript diagnostics (`astro check`)

## Conventions

- **Commits:** meaningful, Conventional Commits, one coherent change per commit (see `AGENTS.md`)
- **Validation:** run `pnpm check` and `pnpm build` before committing changes to the application
