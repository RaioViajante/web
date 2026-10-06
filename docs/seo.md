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
  only date posts have. A publication date is not a modification date, so
  there is no `dateModified` and no sitemap `lastmod` for posts (sitemaps.org
  defines `lastmod` as the page's last modification, and Google uses it only
  when it is consistently and verifiably accurate). If posts later gain an
  explicit modified date, it becomes both `dateModified` and `lastmod`; the
  checks accept exactly that pairing. The RSS feed keeps the publication date.
  The image is the post's generated social card.
- Docs `dateModified` and sitemap `lastmod` use only an explicit `lastUpdated`
  frontmatter date. No docs page has one yet, so neither is emitted. The page's
  visible "last updated" line may still fall back to the last git commit, but
  that is not a content date for search engines: today it is a design-system
  migration commit, not an edit of the documentation. Docs have no publication
  date, so none is claimed.
- Authors: dump posts and the root and dump sites name the shared person (dump
  states `site.author`; root is the person's own home). Docs and Lab do not: no
  page says who writes them. The docs content `LICENSE` names `RaioViajante` as
  copyright holder, which is not an authorship statement, and the terms pages say
  the sites are run by RaioViajante (the CNPJ holder). Adding an author or
  `copyrightHolder` there needs an explicit decision.
- Docs breadcrumbs follow the navigation: `docs`, the page a sub-page is
  listed under, then the page. The `projects/` and `raioviajante/` folders have
  no pages, so they are not breadcrumb items. (The visible breadcrumb on a docs
  page does show folder names; the structured one lists only real pages.)

JSON-LD is serialized by `jsonLdScript` (escapes `<`). Dump and Root nonce
their blocks. On Docs and Lab it is an inline block without a nonce. Firefox
against the production builds and their committed CSP reported no violation
for any of these blocks (root, dump home and article, docs, lab), no
console errors, and unaffected hydration; the same listener did report a
blocked `fetch` and a blocked inline script, so it would have caught one. No
nonce or hash change was needed.

## Sitemaps and robots

Each host serves `/sitemap.xml` (absolute production URLs, no 404 or utility
pages) and `/robots.txt` (`Allow: /`, absolute sitemap URL). `lastmod` appears
only with an explicit modification date: none exists today, so no sitemap has
one. A docs page's explicit `lastUpdated` (or a future explicit post date) would
add it; git dates and build times never do.

## Indexing decisions

Search, terms and privacy pages are indexable and in the sitemap, as the
authors had them; search keeps one canonical URL (`?q=` is never canonical).
404 pages are `noindex` and not in sitemaps (Next marks its own 404s, Astro's
`404.html` carries `noindex, follow`).

## Manifest

Name, start URL, icons and the background color. `display` is `browser`: the
sites have no service worker, offline mode or app shell (a test fails if a
service worker is added), so they do not claim one.

## Not verifiable locally

Production redirects (www to apex, and whether the hosts redirect
`/search` to `/search/` for the Astro apps; Astro's local preview does not),
the live canonical host after deployment, and anything search engines do with
the markup.

## Automated checks

The contract above is enforced by `seo/metadata-policy.ts` (pure rules) and run
two ways. There is no list of pages: the inventory is each app's own
`/sitemap.xml`.

- `pnpm seo:check` (part of `pnpm validate`, after the build): the rules'
  own tests with one failing fixture per rule, plus the public build output of
  the static apps. Docs and Lab publish plain files in `dist/`, so their
  sitemap, robots.txt, manifest and every sitemap document are checked in full.
  Root and Dump render documents per request, and their sitemap, robots,
  manifest and RSS come from Next routes whose build layout is private to Next,
  so this check deliberately does not read `.next`: a harmless Next update must
  not fail validation. `pnpm seo:verify` checks all four apps, those included.
  It needs the apps built with `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com`
  and no sockets.
- `pnpm seo:verify`: starts (or reuses) the four built apps and checks every
  sitemap document over local HTTP, all 71 today, plus content types, social
  image and icon URLs, the search canonical with a query string, missing routes
  and the Dump RSS cross-check against each post. Exit code 2 means the apps
  could not start and nothing was verified. Phase 10 can wire it into CI.

Per page it enforces: one `<title>`, meta description, canonical (absolute
HTTPS, own production host, no query, equal to the sitemap URL), `lang="en"`,
no `noindex`, one of each `og:*` and `twitter:*` tag, the theme color token,
icon, apple-touch-icon and manifest links, Dump's RSS link, and `rel="me"` on
the Root and Dump GitHub link. Titles and descriptions are unique across all
documents (the failure names both URLs and the value). Per app: valid sitemap
(production host, no duplicates, queries, fragments or 404s; `lastmod` only
where real dates exist and never in the future), robots (Allow, one production
Sitemap line, nothing blocking a sitemap page), manifest (`display: browser`,
theme and background color), and Dump's RSS (production URLs, real dates, every
item in the sitemap). JSON-LD is checked per page class (see Structured data):
valid JSON, `https://schema.org`, the expected types, production URLs only, one
shared Person, no author on Docs or Lab, no publisher, `dateModified` on a
docs article or post only together with the same sitemap `lastmod` (and never
equal to the publication date), breadcrumb positions and URLs that are real sitemap pages, and
`BlogPosting` headline and date agreeing with the page and the RSS item.

Not covered: that a search engine accepts the markup, Vercel's production
redirects, and the visual breadcrumb. The HTML is read with small regular
expressions that match this repository's own markup, not a general parser.
