# Dump design

Dump uses the shared design system in `@raioviajante/design`. `app/layout.tsx`
imports `styles.css` and renders the shared `<Behavior />` script once. Every
page renders `components/DumpShell.tsx`, which configures the shared `Shell`
(sidebar, sound toggle, 740px column, footer) with dump's pages (posts,
archive, tags) and the search item. A post counts as "posts" in the sidebar and
adds its sections to "on this page". Navigation uses `next/link` through the
shared `linkComponent` prop, without prefetching. The design handoff's static
pages were the visual reference during the migration; the root site's values,
now in the shared tokens, took precedence where they differed. `lib/seo.ts`
lists every page's title and description for metadata, the social cards under
`/og/` and the sitemap; RSS stays at `/rss.xml` (English) with `/pt/rss.xml` for Portuguese.

`app/globals.css` holds only what is dump's own: the featured post, the month
lists, the archive date column (a long date column, stacked above the title on
narrow screens), the tag grid, the reading progress bar and the
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

## Localized copy

Every user-facing string Dump owns (page titles and descriptions, section
titles, empty states, plural forms, reading time, comment states, 404 copy,
accessible labels) lives in `lib/copy.ts` as one complete object per locale,
`satisfies Record<LocaleId, DumpCopy>`. A missing key or locale fails type
checking, `tests/copy.test.ts` compares the shapes, and there is no English
fallback inside a Portuguese page. Components read it through `dumpCopy(locale)`
and never branch on a boolean such as "is Portuguese" (`tests/localized-chrome.test.tsx`
guards this). Counts use `pluralCategory` (`Intl.PluralRules` of the registry
locale; zero takes the plural form). Shared chrome (navigation labels, footer,
search prompts, pager) stays in `packages/design`'s catalog.

Dates render with `formatPostDate` in the registry's `Intl` locale, in UTC, on
every page: "September 27, 2026" in English and "27 de setembro de 2026" in
Portuguese. `<time datetime>` always carries the ISO date.

Portuguese search passes explicit `suggestions` (`lib/search-suggestions.ts`)
because the shared defaults are English words; `tests/search-suggestions.test.ts`
checks that every site suggestion matches an entry of the real Portuguese index.

The home page omits the Series section in a locale where no series part is
published, and numbers the sections after it without a gap. The Follow section
links the feed of the page's locale (`/rss.xml` or `/pt/rss.xml`). The RSS
autodiscovery link carries a locale-specific title ("dump RSS" and
"dump RSS (português)") so readers can tell the two feeds apart.

Series membership is curated in `lib/post-details.ts` until it becomes part of
post frontmatter. Reading times use a 220 words per minute estimate, excluding
fenced code. Related posts are selected by shared tags, not hand-authored
links. The Terms and Privacy pages use the shared legal template; sentences that
needed an unconfirmed fact (a license, a retention period, a date) are left out
rather than shown as placeholders. `/pt/terms` and `/pt/privacy` are
translations of the English pages: same sections, same facts, no added or
removed clause, not a new revision. They need an owner and legal review before
they are published (see `i18n.md`, "Legal pages").
