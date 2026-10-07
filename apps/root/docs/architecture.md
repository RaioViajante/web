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
