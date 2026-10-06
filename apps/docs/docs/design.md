# Design

docs.raioviajante.com uses the shared design system in `@raioviajante/design`
(tokens in `docs/design-system.md` at the repository root). It no longer has a
visual language of its own: no purple accent, no serif prose font and no theme
toggle remain.

## Structure

- `astro.config.mjs` sets the Markdown pipeline: `remark-directive`, the shared
  `remarkSoftCallouts`, the shared `rehypeNumberSections`, `rehypeSteps` and
  `rehypeSoftBlocks`. Code is highlighted at build time with the shared theme.
- `src/layouts/DocsShell.astro` is the one layout: head, the shared shell
  (`src/components/DocsFrame.tsx`, rendered statically) and the shared
  behavior script. Styles come from `@raioviajante/design/styles.css` and
  `src/styles/docs.css`, which holds only docs' own pieces. Noto Sans Mono is
  self-hosted through `@fontsource-variable/noto-sans-mono`.
- Two columns, like every site. "On this page" sits in the sidebar under
  PAGES; there is no right column. A page that belongs under another (the
  Sweep CLI reference) is a `sub` item: `01.1 cli reference`.
- `src/pages/[...slug].astro` renders every documentation page: breadcrumb
  label, status word and meta row, numbered sections, steps, tables, callouts,
  "last updated" and "edit this page on GitHub", and previous/next. The
  homepage, search, Terms, Privacy and the 404 are their own pages.
- Starlight was removed. Pagefind went with it: search is the shared
  client-side search over `/search-index.json`.

## Content rules

- A page needs the frontmatter in `src/content.config.ts`; `order` decides the
  sidebar, previous/next and home order.
- "Last updated" is the date of the last commit that touched the page's file,
  read from git at build time. It is left out when git history is unavailable
  or shallow, never guessed. There is no version or commit hash in the footer
  until the project publishes versions.
- No placeholder renders on a public page. Pages that need a fact the
  repository does not have leave it out.

## Explicitly avoid

Generic documentation-SaaS aesthetics, cards, bento grids, glassmorphism,
gradients, glow, decorative blobs, unnecessary animation, marketing heroes.
