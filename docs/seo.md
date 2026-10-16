# SEO metadata and structured data

Checked against local production builds of all four apps (every sitemap
document, plus the four search pages that are deliberately not in them). Nothing was submitted to a search engine, and hosting redirects
were not touched.

## What every page has

Title, description, canonical URL on the production host, `og:*` and
`twitter:*` tags with a generated social card that exists at its URL, `lang="en"`,
icon links and the manifest, and `theme-color` (the page background token,
read from `styles/tokens.css`). Titles and descriptions are unique across all
pages. Root and Dump use Next metadata; Docs and Lab use `seo/SeoHead.astro`. The
pieces that repeat live in `seo/metadata.ts`.

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
  frontmatter date. No docs page has one yet, so neither is emitted. The
  visible "last updated" line follows the same rule (explicit `lastUpdated`
  only): git commit dates were dropped because the only ones available were a
  design-system migration commit, not an edit of the documentation. Docs have
  no publication date, so none is claimed.
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

Each host also serves `/llms.txt`: a concise, curated discovery index in English.
It is optional documentation for readers and tools, not an SEO requirement,
crawler policy or replacement for robots.txt and sitemaps. `seo/llms.ts` owns
the renderer and discovery copy, using canonical origins from `site/sites.ts`.
Root points to identity, projects and the other sites; Dump to writing indexes
and RSS; Docs to its public documentation; Lab to its experiment index.
Next.js uses static route handlers; Astro emits the endpoints at build time.
No full-content mirror or additional crawler files are generated.

`pnpm seo:verify` checks all four llms.txt responses and their content types,
then requires every discovery link to be a verified sitemap page or the Dump
feed. It also checks each `/.well-known/security.txt` response against the
shared security policy (including expiration and host-specific canonical).
Astro preview serves emitted `.txt` files without a charset, so the local check
accepts `text/plain` there. Production security.txt must include UTF-8,
as described in [security-txt.md](security-txt.md).

Terms and privacy pages are indexable and in the sitemaps.

The four `/search` pages are `noindex, follow` and not in any sitemap. They
stay reachable and crawlable (robots.txt must not block them, or crawlers could
not see the `noindex`) and keep one canonical, the bare `/search` URL: `?q=` and
tracking parameters never change it. Why: before a query each is a form with
about 35 words of prompt text, near-identical on all four sites, and the results
need typed input and client JavaScript, so there is nothing for a search engine
to index (Google documents no policy against indexed internal search pages, but
treats them as low value). `isSearchPath` in `seo/metadata.ts` is the
one place that drives the robots meta, the sitemap exclusion and, through
`seo/metadata-policy.ts`, the checks.

404 pages are `noindex` and not in sitemaps. Astro's `404.html` carries
`noindex, follow`. Next documents injecting `noindex` on its 404 responses and
does so for a page-level `notFound()`, but on Vercel an unmatched URL is served
through the `/_not-found` route and arrived without it (observed live after the
first production deploy). Root and Dump therefore also declare
`robots: { index: false }` in the `not-found` metadata (`notFoundMetadata` in
`seo/metadata.ts`). Where Next also injects its own tag the page carries two
identical `noindex` tags, which is harmless. The status was always a real 404.

## Locale-aware metadata

`seo/` serializes locale facts that apps supply and validates them; it never
discovers a translation. The registry in `site/locales.ts` provides every
spelling ([i18n.md](i18n.md)). Today only English pages exist, so the visible
change is one tag: `og:locale` (`en_US`) on every page, which Root, Docs and Lab
gained.

- `PageSeo` (and `SeoHead`) take an optional `locale` (default English) and
  `counterparts`: real, public pages in other locales, as `{ locale, path }`
  in the host's own form. A page without counterparts emits no `hreflang`
  (not even a self-reference) and no `og:locale:alternate`. Nothing is
  inferred from paths, slugs, titles or filenames.
- A localized page canonicalizes to itself. A cluster lists the page, every
  counterpart and `x-default` on the English member. Contradictory facts
  (a path outside its locale, a repeated locale) throw instead of publishing;
  a page's own locale and path are checked even when it has no counterpart.
- `checkLocaleInventory` validates an app's inventory of public localized
  routes: every counterpart is a declared route in its own locale and lists the
  page back, and paths follow the host's trailing-slash form.
- `checkDocument` checks `lang` and `og:locale` against the page's locale and
  each cluster. `checkAlternateReciprocity` and `checkEntityLanguages` run over
  all of an app's documents in `seo:check` (Docs, Lab) and `seo:verify`.
- Search (`/search`, `/pt/search`) stays `noindex, follow` with one bare
  canonical and out of the sitemap. Its `og:locale` and any `hreflang` cluster
  are checked like a document's, and real search pages take part in
  `checkAlternateReciprocity`. A 404 in either language is a real 404,
  `noindex`, with no canonical or `hreflang`, and its `lang` must match the copy
  it renders (`checkNotFoundPage`, where the language is always required). The
  one exception is the missing Dump post, whose generic Next error document has
  no `lang`; `seo/verify-metadata.mjs` tolerates only that, until the Dump 404
  slice fixes it.
- Structured data: `BlogPosting`, `TechArticle` and `WebPage` (also when nested
  as `mainEntityOfPage`) state the rendered locale; `BreadcrumbList` and `Person` state none; `WebSite` and `Blog` state
  the set of shipped locales, the same on every page that emits them.
- Sitemaps stay one per host with plain entries. `xhtml:link` alternates are
  rejected, and `lastmod` still comes only from an explicit `updatedAt`.
- Singular on purpose: one manifest, one English `/llms.txt`, one `robots.txt`
  and one `security.txt` per host.

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
  sitemap document over local HTTP, plus each search page (200,
  `noindex, follow`, one bare canonical, also with `?q=` and tracking
  parameters), content types, social image and icon URLs, missing routes and
  the Dump RSS cross-check against each post. Exit code 2 means the apps
  could not start and nothing was verified. CI runs it in the blocking `quality`
  job ([ci.md](ci.md)).

Both also hold the English baseline, `seo/english-baseline.json`: every
recorded sitemap page, discovery endpoint and search-index page must still be
served, and the index keeps its fields. It is a floor, so added pages (including
localized ones) never fail it. `pnpm seo:baseline` regenerates it from the
built apps; use it only for a deliberate English change and review the diff.
RSS item identity is not part of it.

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
