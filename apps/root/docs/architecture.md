# Architecture

Root is a Next.js application deployed independently at `raioviajante.com`.
It owns `/`, `/about`, `/projects`, `/contact`, `/gallery`, `/this-site`, `/setup`,
`/privacy`, and `/terms`. Dump, docs, and lab are separate apps at
their respective subdomains; root links to them by URL and does not import
their source code.

The app layout imports the framework-neutral editorial shell from
`@raioviajante/design/editorial.css`. Root-specific styles and content remain
inside this app. Reusable local pieces such as navigation, section headings,
leader rows, and the footer live in `components/`.

Home obtains recent writing from dump's public RSS feed in `lib/writing.ts`.
The homepage and feed request each revalidate after 60 seconds. New published
posts appear without redeploying root after dump's RSS feed is deployed and
the cache refreshes on a subsequent visit. A small
known-post list keeps the page populated if the feed is temporarily unavailable.
This is a read-only integration; publishing still happens in dump.
