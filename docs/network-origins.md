# Network origin policy

## What it protects against

An app quietly starting to contact a new host: an analytics snippet, an embed,
a font or image CDN, a copied tracking pixel. The policy lists every origin the
four apps may contact from the browser; anything else fails validation.

CSP (`security/headers.ts`) is the enforcement layer: the browser blocks what
the policy does not allow. This origin policy is a regression and detection
layer: it fails the build when code changes what the apps actually request,
including requests a loosened CSP would no longer stop. They are related but
not the same, and the lists are not identical (CSP also names things such as
`'self'` and frame origins that are not requests; the policy is about origins
actually contacted).

## Classes

- **Own**: the app's own origin.
- **Sibling**: another RaioViajante host (`raioviajante.com`, `dump.`, `docs.`,
  `lab.`). Technically cross-origin, first-party in this ecosystem. Every app
  may contact the other three, because search's "everywhere" scope reads their
  public `/search-index.json` (`packages/design/search/client.ts`); the runtime
  check fails if an app never requests one of its allowed siblings.
- **Third party**: everything else. Currently only on dump, for the comments
  widget (below). `data:`, `blob:` and `about:` are internal.
- **Frame-internal**: what an approved third-party frame loads for itself.
  Observed and reported, never enforced (see below).

## Approved third parties and frames

`security/network-origins.ts` is the single policy. Own and sibling origins are
derived from `siteOrigins` in `headers.ts`; only third parties are listed by
hand, each with a reason.

| App  | Kind                                      | Origin               | Why                                                                                                          |
| ---- | ----------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------ |
| dump | origin the page contacts                  | `https://giscus.app` | giscus script, widget frame and discussions API; loaded when comments near the screen or on a sign-in return |
| dump | host an embedded frame may be served from | `https://giscus.app` | the comments widget frame                                                                                    |

Root, docs and lab have none. Both entries are tied to the CSP by a test: the
page origin must be in the CSP and the frame host in `frame-src`, and no GitHub
CDN host may appear in the CSP.

### What is enforced and what is only reported

- **The page's own requests** (script, stylesheet, API, images, prefetches):
  must be own, sibling, or an approved third party in the right state. Anything
  else fails.
- **The frame's host** must be an approved frame host. A frame served from
  anywhere else fails, whatever it loads.
- **What the approved frame loads for itself** (for example
  `github.githubassets.com` for its loading image, or avatar hosts in a
  populated discussion) is reported with counts and does **not** fail. Giscus
  and GitHub control those requests and can change them without any change in
  this repository, so a fixed list of GitHub CDN hosts would break CI for
  reasons we cannot act on. The current observation is in the runtime output,
  not in the policy.
- **Before the trigger**, on a long article, no giscus or GitHub request may
  occur and the initial HTML may contain no giscus script or frame: this is
  still a hard requirement.

The sign-in return (`?giscus=` on the article URL) is its own state: giscus
must load at once, exactly once, with no scroll. That is checked from the DOM,
not by counting `client.js` requests, because the script may come from the HTTP
cache.

## Adding an origin intentionally

1. Add it to `thirdParties` (or `frameHosts`, for a frame) in
   `security/network-origins.ts` with a specific reason and the state in which
   it is contacted. Do not add what a frame loads for itself.
2. If the page itself loads it, add the origin to the CSP in
   `security/headers.ts` (a separate, reviewed change) and run
   `node security/sync-vercel.mjs`.
3. Update the table above, the privacy pages and `docs/privacy-storage.md`.
4. Run both checks below. Nothing updates the policy automatically.

## Checks

Fast and deterministic, part of `pnpm security:check` and `pnpm validate`, no
browser or network:

```sh
node --test security/network-origins.test.mjs
```

It tests the policy against `siteOrigins` and the CSP, the classifier
(including look-alike hosts such as `raioviajante.com.evil.example`) and the
failure message, and statically scans shipped source for absolute URLs given to
`fetch`, `WebSocket`, `EventSource`, `sendBeacon`, `src`, `srcSet`, `@import`
and `url()`. The scan is limited to those literal forms: it cannot see URLs
built at run time, ignores `href` navigation, docs, tests and the CSP, and does
not prove runtime behavior.

Runtime, separate because it needs built apps, local sockets and Firefox:

```sh
pnpm -r build   # with NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com
pnpm security:origins
```

`security/verify-origins.mjs` reuses running local servers or starts the four
built apps, drives headless Firefox through WebDriver BiDi (no new dependency;
`FIREFOX_BIN` overrides the binary) and uses `*.localhost` hosts so the
production sibling URLs are really requested. It visits every sitemap document
of all four apps, uses search's "everywhere" scope in each app, presses every
control on each lab experiment, and checks dump comments on a long article in
three states: before the trigger (no giscus or GitHub request and no script or
frame in the initial HTML), after scrolling to the comments (giscus.app
requested, `client.js` exactly once, a frame served from giscus.app; the frame's
own requests are listed as "reported, not enforced") and a sign-in return. A
short article whose comments start within 200px of the first screen may load
giscus on arrival; that is allowed only when the section is actually that near.
Failures print the app, page, origin and URL, for example:

```
app dump page /posts/example (after comments trigger): unexpected frame host https://evil.example (request https://giscus.app/x)
app root page /: unexpected origin https://tracker.example (document) https://tracker.example/p.gif
```

The two giscus states need the public internet, so there are two modes:

- **Full** (no variable; the observational job): the real external services are
  contacted and observed.
- **Deterministic** (`ORIGINS_SKIP_THIRD_PARTY=1`; the blocking check): the
  network is controlled and nothing leaves the machine. BiDi interception answers
  a request to a sibling's production origin from that sibling's local server,
  lets loopback through, and fails every other request before it is sent. The
  giscus states are skipped, and a short article that loads comments on arrival
  has its giscus request blocked rather than made, whatever the page geometry.
  Any other blocked origin fails the run. Firefox also gets a proxy that records
  and refuses every connection it is handed, to catch what interception cannot
  see; Mozilla, OpenH264 and Google update hosts are reported as browser-internal,
  and any other host fails. Everything else, including the before-trigger
  requirement, still runs.

Exit code 2 means Firefox or a build was missing and nothing was verified.

## Limits

- Requests are those Firefox reports. Requests made inside the giscus frame
  were reported and attributed to the frame, but cookies, storage and anything
  the frame does that is not a network request are not visible.
- Only the paths above are exercised. A real sign-in (the redirect through
  GitHub, which is a top-level navigation and not a request from the page), a
  real token, posting and a populated discussion are not; the sign-in return is
  tested with a made-up `?giscus=` value.
- `Cross-Origin-Opener-Policy: same-origin` stays. Giscus's sign-in is a link
  with `target="_top"` followed by redirects, with no popup or `window.opener`
  (from its published source), so the policy does not apply to it; the real
  flow was not exercised.
- It runs against local production builds, not Vercel. What the platform adds
  at the edge and the deployed hosts are covered by the live checks in
  [operations.md](operations.md). No platform host is allowed in the policy.
