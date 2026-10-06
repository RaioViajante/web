# Browser storage and third parties

A technical inventory of what the four apps do in the browser, checked against
source, built output and a production build run locally in headless Firefox
(WebDriver BiDi network log). It states facts only. It is not a legal
assessment and says nothing about whether any consent mechanism is required;
that decision needs review by the site owner.

`security/storage-inventory.test.mjs` (run by `pnpm security:check`) fails when
a storage API, a third-party script origin or an analytics dependency appears
outside what is listed here.

## Browser storage

| Mechanism                            | Where                          | Source                                |
| ------------------------------------ | ------------------------------ | ------------------------------------- |
| Cookie `rv-sound`                    | root, dump, docs, lab          | `packages/design/sound/preference.ts` |
| `localStorage` key `rv-sound` (read) | root, dump (legacy value only) | `packages/design/sound/preference.ts` |
| `sessionStorage`, IndexedDB          | none                           | —                                     |
| Cache Storage, service workers       | none                           | —                                     |
| Other cookies or storage             | none set by the apps           | —                                     |

### `rv-sound` cookie

- First party, set from JavaScript (`document.cookie`), so not `HttpOnly`; the
  page code must read it. All four apps include the shared sound toggle, so all
  four read and write it.
- Purpose: remember whether sound is on. Value is `on` or `off`. No identifier.
- Created only by `setEnabled` when the visitor switches sound on or off.
  Loading a page, reading the preference and navigating write nothing; a
  browser check on a dump page showed an empty `document.cookie` and empty
  `localStorage` until the toggle was pressed.
- Production attributes: `Path=/; Max-Age=31536000` (one year, a reasonable
  lifetime for a preference that the visitor can change at any time);
  `SameSite=Lax; Domain=.raioviajante.com; Secure`. It is therefore sent to
  and shared by every `*.raioviajante.com` host, which is the intent: one
  setting across the sites.
- Hosts that are not `raioviajante.com` or a subdomain (local development,
  `*.localhost`, look-alike domains) get no `Domain`, so the cookie stays host
  only; `Secure` is added only on `https:` because browsers reject it over
  http.
- Deleting: the visitor's browser settings, or expiry after one year from the
  last change.
- Legacy: earlier versions of root and dump stored the choice under the same
  key in `localStorage`. That value is only read, on that one origin, and only
  when no cookie exists; reading never writes a cookie or changes it. The next
  time the visitor switches sound, the cookie is written and the legacy value
  is removed. Until then it is not shared with other subdomains.

### Theme and other preferences

The palette is fixed. There is no theme setting, bootstrap script or stored
theme in any app. Search state is held in page memory only and is not
persisted. Lab experiment input and results are page memory, lost on reload.

## Third-party activity

No analytics, telemetry, advertising, profiling or tracking-pixel code or
dependency is present in any app, and no Vercel client-side analytics script
appears in built output. All four apps contain ordinary links to GitHub and
other sites; links load nothing until followed.

| App  | Third-party origin contacted by the page                            | When                         |
| ---- | ------------------------------------------------------------------- | ---------------------------- |
| root | none                                                                | —                            |
| docs | none                                                                | —                            |
| lab  | none                                                                | —                            |
| dump | `giscus.app`, and `github.githubassets.com` inside the giscus frame | only after the comments load |

Search's "everywhere" scope fetches the public search indexes of the other
RaioViajante sites; those are first-party (same owner) origins.

### Giscus on dump articles

`apps/dump/components/Comments.tsx`. The article HTML contains a local status
line and no giscus script, link hint or frame, so nothing is contacted by the
initial HTML. The script is inserted by JavaScript when the comments section
comes within 200px of the viewport (`IntersectionObserver`), at most once. On a
short article that can happen as soon as the page opens, with no scrolling or
click. Where `IntersectionObserver` does not exist, nothing loads until the
visitor presses "Load comments". Giscus configuration is unchanged.

Observed in the local Firefox run, opening a long article: only first-party
requests. After scrolling to the comments: `https://giscus.app/client.js`,
`default.css`, the `en/widget` frame and `api/discussions` requests, the
first-party `/giscus.css` theme, and
`https://github.githubassets.com/images/mona-loading-default.gif`. The
production CSP already allows the script and frame; no CSP change was needed.

Not inspected: cookies or storage that giscus.app or GitHub set inside their own
frame, their retention, and any behavior after signing in. Those are controlled
by giscus and GitHub. Authenticated posting was not tested, and neither was
the live production site.

## Updating

When behavior changes, update this page and the privacy pages in each app
(`apps/root/app/privacy`, `apps/dump/app/privacy`,
`apps/docs/src/components/PrivacyPage.tsx`,
`apps/lab/src/components/LegalPages.tsx`), then adjust the allowlists in
`security/storage-inventory.test.mjs`.
