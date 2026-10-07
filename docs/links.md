# Link and resource checks

`pnpm links:check` crawls the local production builds (no DNS or internet) and
fails on a broken internal link or first-party resource. It first runs the
extraction and classification tests (`links/extract.test.mjs`). `pnpm
links:external` adds an observational check of external links. Neither is part
of `pnpm validate`.

## What is crawled

Every sitemap page of the four apps plus each app's `/search` page (71
documents). Links on any of the four production hosts are mapped to the
matching local server, so `https://docs.raioviajante.com/...` is checked against
the local docs build. The 404 pages are not crawl targets.

## Internal links, 1,066 of 1,378 today

Each distinct destination must answer 200. Fails: a 404, a malformed URL, a
`localhost`, private-address or `*.vercel.app` URL, a non-https external link,
an unsupported scheme, a `mailto:` that is not an address, and a **redirect**:
an internal link must point at the destination, not at something that
redirects, including a missing or extra trailing slash (the Next apps redirect
`/x/` to `/x`; the Astro apps use `/x/`, so their links must end in a slash).
Fragments are checked against the real target document, same page or another
(193 checks): a docs heading link or the dump "on this page" list that points at
an id that does not exist fails. 79 `mailto:` links are syntax-checked.

## Known redirects

Taken from the app's own config, not from a copy: dump's `/about` goes to the root
`/about` and `/uses` to the root `/setup` (both 308). The check confirms they
still exist, are permanent, point where the config says and land on a live page;
a link _to_ one of them still fails, so content links to the destination.

## First-party resources

Stylesheets, scripts, icons, the manifest, font and image preloads, `<img>` and
`srcset`, and the `url()` references inside stylesheets (fonts, images) must be
served from the app itself, answer 200, be non-empty and have a sensible content
type. `security/verify-http.mjs` checks headers and CSP on a sample of assets and
`seo/verify-metadata.mjs` checks social images and icons; this one follows what
the pages actually reference.

## External links

The deterministic gate only validates their syntax (absolute `https`, public
host). `pnpm links:external` also requests each one (27 today) with a timeout,
reports 2xx as ok, 403/429/999 as "blocked or rate limited", 404/410 as "likely
broken" and anything else as unexpected, and **never fails the run**: remote
availability is not ours to gate on.

## Failures

```
[docs] / (+8 more): /projects/sweep/#missing-id: no element with that id
[docs] /: link to the redirect /about; link to https://raioviajante.com/about directly
```
