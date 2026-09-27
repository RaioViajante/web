# Production origin

**Canonical `dump` origin: `https://dump.raioviajante.com`**

The apex `raioviajante.com` and `www.raioviajante.com` are intentionally **not** configured for this project — the apex stays free for a future root RaioViajante site. This project owns only the `dump` subdomain.

Origin resolution is centralized in `lib/site.ts` (`resolveSiteUrl()`), priority order:

1. `NEXT_PUBLIC_SITE_URL` — set to `https://dump.raioviajante.com` in Vercel (below).
2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel's automatic `*.vercel.app` host, used only if the explicit var is unset.
3. `http://localhost:3000` — local development fallback; no production domain required to develop locally.

`metadataBase`, `alternates.canonical`, Open Graph URLs, the RSS feed, and the sitemap all derive from `site.url` / `absoluteUrl()` — there is no second place that builds URLs, so setting the one environment variable is sufficient.

## Vercel configuration

Done:

- Project `dump` (`prj_aLr1Ds2A7hb3oEcwchcU7r3map69`), under the `bryanalvarenga-5889s-projects` scope.
- Custom domain `dump.raioviajante.com` added and verified (`vercel domains verify` → `configured-correctly`).
- `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com` set on the **Production** environment only.
- Deployed and live at the canonical origin (issue #23).

**Known gap:** Vercel's GitHub App failed to auto-connect this repository when the project was created, and re-checking since (`vercel project inspect dump`) still shows no Git Repository link. Deployment is currently **CLI-only** (`vercel deploy --prod` from a local checkout) — pushing to `main` does not trigger a deploy. Fixing the connection is an interactive step (authorizing Vercel's GitHub App for `RaioViajante/dump`) not attempted here; once connected, Preview/Production deploys and PR checks come from Vercel's own Git integration automatically, no config change needed on this side.

## Cloudflare DNS

Configured and live, in the `raioviajante.com` zone:

| Field        | Value                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Type         | CNAME                                                                                             |
| Name         | `dump`                                                                                            |
| Target       | `1d6a74d940b03953.vercel-dns-017.com.` (the project-specific value Vercel's domain-add flow gave) |
| Proxy status | DNS only                                                                                          |
| TTL          | Auto                                                                                              |

No other record on the zone was touched. The apex (`raioviajante.com`) and `www` remain unconfigured, as intended.

## What's already correct in the app (no code changes needed)

Verified during this issue — all of the following already resolve exclusively through `site.url` / `absoluteUrl()`, so once the environment variable above is set in Vercel, no further code changes are required:

- `app/layout.tsx` — `metadataBase: new URL(site.url)`, site-level Open Graph (deliberately has no `url`, so it doesn't force every page's OG url to the homepage).
- `app/posts/[slug]/page.tsx` — `alternates.canonical` and per-post `openGraph.url`, both relative paths resolved against `metadataBase`.
- `lib/rss.ts` / `app/rss.xml/route.ts` — channel `<link>`, `atom:link` (feed self-URL), and every item's `<link>`/`<guid>` via `absoluteUrl()`.
- `app/sitemap.ts` — every entry via `absoluteUrl()`.

Confirmed by building locally with `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com`: rendered `<head>` canonical/OG tags, `rss.xml`, and `sitemap.xml` all resolve to `https://dump.raioviajante.com/...` with zero `localhost` occurrences in any user-facing output. The remaining `localhost` strings in the build are Next.js's own framework runtime (private-hostname regexes, dev-server fallbacks) — not app content.
