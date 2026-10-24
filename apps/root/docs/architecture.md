# Architecture

Root is a Next.js application deployed independently at `raioviajante.com`.
It owns `/`, `/about`, `/projects`, `/contact`, `/gallery`, `/this-site`, `/setup`,
`/search`, `/privacy`, and `/terms`. Dump, docs, and lab are separate apps at
their respective subdomains; root links to them by URL and does not import
their source code.

The app layout imports `@raioviajante/design/styles.css` and renders the shared
`<Behavior />` script. Pages are built on the shared `Shell` through
`components/RootShell.tsx`. Root-specific styles and content remain inside
this app; the shell, page parts, footer, artwork, sound and search come from
the package.

Home obtains recent writing from dump's public RSS feed in `lib/writing.ts`.
Every page is rendered per request, because the layout calls `connection()`
so each document gets its own CSP nonce; responses are not cached. The feed
request itself is cached and revalidated after 60 seconds. New published posts
appear without redeploying root once dump's RSS feed is deployed and that
cache refreshes on a subsequent visit. A small
known-post list keeps the page populated if the feed is temporarily unavailable.
This is a read-only integration; publishing still happens in dump.

## Portuguese tree (pt-BR)

Root publishes a partial Portuguese tree and participates in Portuguese through
`site/`, after its public locale contract was verified in production. See
[docs/i18n.md](../../../docs/i18n.md).

- **Route registry.** `lib/routes.ts` declares which pages exist in which
  locale (every page: Home, About, Projects, Contact, Gallery, This Site, Setup,
  Terms, Privacy and Search in Portuguese at `/pt`, `/pt/about`,
  `/pt/projects`, `/pt/contact`, `/pt/gallery`, `/pt/this-site`, `/pt/setup`,
  `/pt/terms`, `/pt/privacy`, `/pt/search`). Navigation, metadata,
  counterparts (`hreflang`), the sitemap, social cards and the search index all
  derive from it. `tests/routes.test.mjs` (`pnpm --filter @raioviajante/root
test`, Node's built-in runner) checks that every declared path is a built page
  and every built page is declared, plus the shared inventory rules.
- **Copy.** Portuguese editorial copy is Root's own, in `lib/pt.ts`. Shared UI
  strings come from the `packages/design` catalog. English-only destinations are
  named as such in words and carry `hreflang="en"`; Terms and Privacy stay
  English-only.
- **Locale.** The proxy sets `x-locale` from the URL (overwriting any client
  value). The one root layout renders `<html lang>` from it, and
  `app/not-found.tsx` renders the English or Portuguese 404 from it. Misses are
  answered by that global not-found, with a real 404 and server-rendered,
  correctly-languaged HTML. Do not call `notFound()` from a Root page: in
  Next.js 16 it produces a generic error document without `lang`.
- **Search.** `/pt/search-index.json` is static and lists only the published
  Portuguese pages (`locale: "pt-BR"`). The shared Portuguese search page reads
  it because Root participates in the locale.
- **Latest writing.** English is unchanged. Portuguese reads Dump's
  `/pt/rss.xml` only once Dump participates in Portuguese; before then it says
  so in Portuguese and links the English Dump, labelled. It never shows English
  posts as Portuguese content.
