# Browser and accessibility checks

`pnpm browser:check` drives the four built apps in Chromium with Playwright and
axe. It is separate from `pnpm validate` on purpose: it needs browser binaries
and local sockets. It runs nothing against public hosts.

## What it checks

- **Every sitemap document** of every app, discovered from the app's own
  `/sitemap.xml` (no second route list), plus each app's `/search` page (noindex,
  so not in a sitemap), `/search?q=…` and one missing route (404). Currently
  root 9, dump 45, docs 7 and lab 6 sitemap pages, 79 documents in all.
- **Two viewports each**, 1440 and 390 CSS pixels (height 900 and 844), asserted
  from `window.innerWidth`: 158 page audits.
- **Per page:** an axe scan with the default rule set (zero violations
  required; nothing is suppressed); exactly one `h1` and one `main`; no
  horizontal document overflow and nothing outside the viewport unless a
  scrollable container clips it (code blocks); no broken images after scrolling;
  no page error, console error or console warning.
- **Interaction, with the real keyboard** (`e2e/interactions.spec.ts`): skip link
  and navigation with the shared 2px focus ring (read from `base.css` and
  `tokens.css`, not restated); search input, scope buttons, result selection and
  `?q=` with the bare canonical and `noindex, follow`; the sound toggle (no
  cookie before it is used, `rv-sound` on and off after, host-only on localhost);
  dump's comments placeholder, the no-`IntersectionObserver` fallback, the
  failure message with Try again (one script after the retry) and the sign-in
  return (`?giscus=`); every control in each lab experiment reachable by Tab;
  and reduced motion (the avatar loop and every CSS animation stop; the home page
  is checked first to have motion to stop).
- **`e2e/harness.spec.ts`** injects a missing alt, an unnamed button, an
  overflowing element, a broken image, a console error and a page error into a
  real page and requires the audit to name each, so a green run means something.

## Why Giscus is outside it

Comments are third-party and cross-origin. Every non-local request is blocked
and reported, except giscus's `client.js`, which is answered with an empty file
so our own placeholder and failure UI run deterministically. The giscus frame
internals are not our DOM and are never audited; the first-party page is
audited before anything scrolls. Network behaviour toward giscus is the job of
`pnpm security:origins`.

## Running it

```sh
NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm -r build
pnpm exec playwright install chromium   # once per machine
pnpm browser:check
```

It reuses servers already listening on the usual local ports and otherwise
starts the built apps with `security/local-servers.mjs`, stopping the ones it
started. A missing build exits with a message naming the app. The suite takes a
few minutes (about 3.5 for the pages, 1 for the interactions). Locally there are
no retries, so a flaky result is visible; CI can decide later.

Failures name app, route, viewport and cause, for example
`[docs] /projects/sweep/cli/ [390px]: horizontal document overflow:
scrollWidth=414 clientWidth=390`. Screenshots and traces of failed tests are
written to `e2e/.results/` (ignored by git); no video is recorded.

## Scope

Chromium only. The config has one project, so adding Firefox or WebKit later is
a config change. The Firefox WebDriver checks in `security/` and `seo/` remain
as they are. Lighthouse and performance budgets and link and resource checking
are `performance.md` and `links.md`. Not here: CI wiring, caching browser binaries and retries
(Phase 10C).
