# SEO metadata and structured data

Checked against local production builds of all four apps (71 sitemap
documents). Nothing was submitted to a search engine, and hosting redirects
were not touched.

## What every page has

Title, description, canonical URL on the production host, `og:*` and
`twitter:*` tags with a generated social card that exists at its URL, `lang="en"`,
icon links and the manifest, and `theme-color` (the page background token,
read from `styles/tokens.css`). Titles and descriptions are unique across all
71 pages. Root and Dump use Next metadata; Docs and Lab use the shared
`SeoHead`. The pieces that repeat live in `packages/design/seo.ts`.

## Identity

One person, `https://raioviajante.com/#person`, defined in `identity` in
`seo/structured-data.ts` (a plain module imported by relative path, like
`security/headers.ts`, and watched by every app's Ignored Build Step; it is not
part of the design system). Facts published: the handle `RaioViajante` (already
the author name on dump), the home URL and the GitHub profile
`https://github.com/RaioViajante` (the primary link on the root home page and
the follow link on dump). Nothing else is claimed. The full node (with
`sameAs`) is on the root home page only; every other page embeds a reference
(`@id`, name, url) because search engines do not follow `@id` across documents.
Both GitHub profile links carry `rel="me"`.

## Structured data

| App  | Page                | Nodes                           |
| ---- | ------------------- | ------------------------------- |
| root | `/`                 | `Person`, `WebSite`             |
| dump | `/`                 | `WebSite`, `Blog`               |
| dump | `/posts/<slug>`     | `BlogPosting`                   |
| docs | `/`                 | `WebSite`                       |
| docs | documentation pages | `TechArticle`, `BreadcrumbList` |
| lab  | `/`                 | `WebSite`                       |

Not published: `SearchAction` (search is not a URL-template query endpoint),
publisher/logo, `dateModified` on posts, per-experiment types (an experiment
is not a software product or a creative work in any sense the data states), and
any page-level type for search, legal and archive pages.

- `BlogPosting.datePublished` is the post's frontmatter date, which is the
  only date posts have; there is no `dateModified`. Its image is the post's
  generated social card.
- Docs `dateModified` is the page's "last updated" value: an explicit
  frontmatter date, otherwise the last git commit that touched the file, and
  nothing when history is shallow (the same value the page shows). Docs have no
  publication date, so none is claimed.
- Docs breadcrumbs follow the navigation: `docs`, the page a sub-page is
  listed under, then the page. The `projects/` and `raioviajante/` folders have
  no pages, so they are not breadcrumb items. (The visible breadcrumb on a docs
  page does show folder names; the structured one lists only real pages.)

JSON-LD is serialized by `jsonLdScript` (escapes `<`). Dump and Root nonce
their blocks; on Docs and Lab it is an inline data block, which the CSP does
not govern because the browser never executes it.

## Sitemaps and robots

Each host serves `/sitemap.xml` (absolute production URLs, no 404 or utility
pages) and `/robots.txt` (`Allow: /`, absolute sitemap URL). `lastmod` appears
only with a real content date: dump posts (frontmatter date) and docs pages
(as above). Root, lab, and dump's listing pages have none, rather than a
build time.

## Indexing decisions

Search, terms and privacy pages are indexable and in the sitemap, as the
authors had them; search keeps one canonical URL (`?q=` is never canonical).
404 pages are `noindex` and not in sitemaps (Next marks its own 404s, Astro's
`404.html` carries `noindex, follow`).

## Manifest

Name, start URL, icons and the background color. `display` is `browser`: the
sites have no service worker, offline mode or app shell, so they do not claim
one.

## Not verifiable locally

Production redirects (www to apex, and whether the hosts redirect
`/search` to `/search/` for the Astro apps; Astro's local preview does not),
the live canonical host after deployment, and anything search engines do with
the markup.
