# Dump design

Dump uses the editorial shell from `@raioviajante/design/editorial.css`, the same
font and base layout used by Root. The local `app/globals.css` styles writing,
code, search, and article details. The static pages in `raioviajante-design/dump`
are the visual reference. Root's shared tokens take precedence when the bundle's
measured colors or dimensions differ.

The index features the newest published post, groups older posts by month, and
shows links to three editorial series based on real post slugs. Search runs over
published titles, descriptions, and tags, and `/` focuses it. Articles include
reading time, progress, a table of contents, line-numbered syntax highlighted
code with copying, related posts by shared tags, adjacent posts, and matching
Lab experiments where an existing experiment is available. Giscus uses a
custom stylesheet served from `/giscus.css`.

MDX posts can use `<Note>`, `<Important>`, `<Warning>`, and `<Deprecated>` for
left-rule callouts. Fenced code can include a title and highlighted lines using
`rehype-pretty-code` metadata. The renderer labels the language and adds copy
controls and line numbers to ordinary fenced blocks.

The `/about` route redirects to Root's About page. `/uses` remains local because
it lists tools in use for this writing site.

Series membership is curated in `lib/post-details.ts` until it becomes part of
post frontmatter. Reading times use a 220 words per minute estimate, excluding
fenced code. Related posts are selected by shared tags, rather than hand-authored
links. No placeholder content from the design bundle is published.
