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
- **Third party**: everything else. Currently only on dump, after the
  comments widget loads (below). `data:`, `blob:` and `about:` are internal.

## Approved third parties

`security/network-origins.ts` is the single policy. Own and sibling origins are
derived from `siteOrigins` in `headers.ts`; only third parties are listed by
hand, each with a reason.

| App  | Origin                            | Why                                                                                   |
| ---- | --------------------------------- | ------------------------------------------------------------------------------------- |
| dump | `https://giscus.app`              | giscus script, widget frame and discussions API; loaded when comments near the screen |
| dump | `https://github.githubassets.com` | loading image requested inside the giscus frame (frame's own policy, not our CSP)     |

Root, docs and lab have none. The two sets are tied to the CSP by a test:
origins requested by the page must be in the CSP; origins requested only inside
the frame must not be.

Not observed, so not approved: nothing about signed-in or populated discussions
was exercised (the test discussion has no comments), so avatar or other GitHub
hosts that appear then would fail the runtime check and need a deliberate
decision.

## Adding an origin intentionally

1. Add it to `thirdParties` in `security/network-origins.ts` with a specific
   reason and the state in which it is contacted.
2. If the page itself loads it, add the origin to the CSP in
   `security/headers.ts` (a separate, reviewed change) and run
   `node security/sync-vercel.mjs`.
3. Update the table above and the privacy pages and `docs/privacy-storage.md`.
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
control on each lab experiment, and checks dump comments in two states on a
long article: before the trigger (no giscus or GitHub request and no script or
frame in the initial HTML) and after scrolling to the comments (only the
approved origins, `client.js` exactly once). A short article whose comments
start within 200px of the first screen may load giscus on arrival; that is
allowed only when the section is actually that near. Failures print the app,
page, origin and URL, for example:

```
app dump page /posts/example (after comments trigger): unexpected origin https://github.githubassets.com (inside a frame) https://github.githubassets.com/images/mona-loading-default.gif
```

Exit code 2 means Firefox or a build was missing and nothing was verified.

## Limits

- Requests are those Firefox reports. Requests made inside the giscus frame
  were reported (marked "inside a frame"), but cookies, storage and anything
  the frame does that is not a network request are not visible.
- Only the paths above are exercised; the signed-in giscus flow and a
  populated discussion are not.
- It runs against local production builds, not Vercel. Anything the platform
  adds at the edge, and the real deployed hosts, still need a post-deploy
  check. No platform host is allowed in the policy.
