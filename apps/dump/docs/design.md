# Dump design

Dump uses the shared design system in `@raioviajante/design`. `app/layout.tsx`
imports `styles.css` and renders the shared `<Behavior />` script once. Every
page renders `components/DumpShell.tsx`, which configures the shared `Shell`
(sidebar, sound toggle, 740px column, footer) with dump's pages (posts,
archive, tags) and the search item. A post counts as "posts" in the sidebar and
adds its sections to "on this page". Navigation uses `next/link` through the
shared `linkComponent` prop. The static pages in `raioviajante-design/dump` are
the local visual reference; the root site's values, now in the shared tokens,
take precedence where they differ.

`app/globals.css` holds only what is dump's own: the featured post, the month
lists, the archive date column, the tag grid, the reading progress bar and the
font binding for `next/font`.

The index features the newest published post, groups older posts by month, and
links the three editorial series (real post slugs). Archive groups posts by
year and month. Tags split into recurring and once-so-far. Search is the shared
search page; `/` and ⌘K open it. Articles show reading time, a progress bar
(`data-reading-progress`), "on this page" in the sidebar with the current
section marked while scrolling, related posts by shared tags, adjacent posts,
and the matching Lab experiment where one exists.

Posts are compiled on the server at build time by `lib/render-post.tsx`
(`@mdx-js/mdx` with `remark-frontmatter`, `remark-gfm`, `remark-directive`,
`remarkSoftCallouts`, `rehype-slug`, a numbering plugin, and `rehypeSoftBlocks`).
Fenced code, callouts (`:::note` and the other kinds), tables and footnotes use
the shared soft blocks, highlighted at build time with the shared theme; see
`docs/blocks.md` for the fence syntax. Code has no line numbers unless a fence
asks for them. The `##` headings of a post are numbered `01.`, `01.1`, `01.2`.

Giscus loads a stylesheet from `/giscus.css` (`app/giscus.css/route.ts`),
generated at build time from the shared `tokens.css` because the iframe cannot
read the page's custom properties.

The legacy `/about` and `/uses` URLs redirect permanently to
`raioviajante.com/about` and `raioviajante.com/setup`. Neither appears in
dump's navigation or sitemap.

Series membership is curated in `lib/post-details.ts` until it becomes part of
post frontmatter. Reading times use a 220 words per minute estimate, excluding
fenced code. Related posts are selected by shared tags, not hand-authored
links. The Terms and Privacy pages use the shared legal template; sentences that
needed an unconfirmed fact (a license, a retention period, a date) are left out
rather than shown as placeholders.
