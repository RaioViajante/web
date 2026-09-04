# Production origin

**Canonical `dump` origin: `https://dump.raioviajante.com`**

The apex `raioviajante.com` and `www.raioviajante.com` are intentionally **not** configured for this project — the apex stays free for a future root RaioViajante site. This project owns only the `dump` subdomain.

Origin resolution is centralized in `lib/site.ts` (`resolveSiteUrl()`), priority order:

1. `NEXT_PUBLIC_SITE_URL` — set to `https://dump.raioviajante.com` in Vercel (below).
2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel's automatic `*.vercel.app` host, used only if the explicit var is unset.
3. `http://localhost:3000` — local development fallback; no production domain required to develop locally.

`metadataBase`, `alternates.canonical`, Open Graph URLs, the RSS feed, and the sitemap all derive from `site.url` / `absoluteUrl()` — there is no second place that builds URLs, so setting the one environment variable is sufficient.

## Vercel configuration (manual — not yet performed)

The Vercel CLI was not available or authenticated in this environment (no `vercel` binary, no cached package, no `.vercel/project.json` link), and installing/logging in requires an interactive browser or email OTP flow. Per this issue's scope, that step was **not** attempted automatically. To complete it:

1. `vercel login` (interactive) and `vercel link` to associate this repo with the existing Vercel project — do **not** guess the project ID; let the CLI or dashboard resolve it.
2. Add the custom domain to the project: Vercel dashboard → Project → Settings → Domains → Add → `dump.raioviajante.com` (or `vercel domains add dump.raioviajante.com` / `vercel project add-domain` from a linked CLI).
3. Vercel will display the exact DNS target for this domain at that point (a CNAME to a project-specific `*.vercel-dns.com`-style host is typical, but **use whatever value Vercel's UI/CLI actually shows** — do not assume a value from memory).
4. Set the environment variable on the **Production** environment only (Settings → Environment Variables), unless a clear reason emerges to also set it for Preview:
   ```
   NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com
   ```
5. Do not trigger a deploy as part of this — that belongs to #23.

## Cloudflare DNS (manual — exact target pending step 3 above)

`raioviajante.com` is managed in Cloudflare. Once Vercel provides the real target for `dump.raioviajante.com`:

| Field        | Value                                                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type         | CNAME (or whatever record type Vercel's domain instructions specify for this hostname)                                                                |
| Name         | `dump`                                                                                                                                                |
| Target       | _the exact host Vercel displays when the domain is added — not invented here_                                                                         |
| Proxy status | **DNS only** initially (grey cloud), so Vercel can issue/validate the TLS certificate; can be reconsidered afterward if Cloudflare proxying is wanted |
| TTL          | Auto                                                                                                                                                  |

Do not touch any other record on the zone — this only adds the one `dump` record. Do not point the apex (`raioviajante.com`) or `www` at this project.

## What's already correct in the app (no code changes needed)

Verified during this issue — all of the following already resolve exclusively through `site.url` / `absoluteUrl()`, so once the environment variable above is set in Vercel, no further code changes are required:

- `app/layout.tsx` — `metadataBase: new URL(site.url)`, site-level Open Graph (deliberately has no `url`, so it doesn't force every page's OG url to the homepage).
- `app/posts/[slug]/page.tsx` — `alternates.canonical` and per-post `openGraph.url`, both relative paths resolved against `metadataBase`.
- `lib/rss.ts` / `app/rss.xml/route.ts` — channel `<link>`, `atom:link` (feed self-URL), and every item's `<link>`/`<guid>` via `absoluteUrl()`.
- `app/sitemap.ts` — every entry via `absoluteUrl()`.

Confirmed by building locally with `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com`: rendered `<head>` canonical/OG tags, `rss.xml`, and `sitemap.xml` all resolve to `https://dump.raioviajante.com/...` with zero `localhost` occurrences in any user-facing output. The remaining `localhost` strings in the build are Next.js's own framework runtime (private-hostname regexes, dev-server fallbacks) — not app content.
