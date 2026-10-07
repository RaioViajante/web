# Performance checks

Two commands, both against the **local production builds** and neither part of
`pnpm validate` (they need Chromium and local sockets):

| Command                | What it is                                                    | Deterministic? |
| ---------------------- | ------------------------------------------------------------- | -------------- |
| `pnpm perf:check`      | page weight, image and font rules against `perf/budgets.json` | yes (bytes)    |
| `pnpm perf:lighthouse` | Lighthouse scores and lab timings, mobile and desktop         | no (variance)  |

Run `pnpm -r build` first (`NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com`).
Lighthouse uses the Chromium that Playwright already manages (the runner starts
it with a debugging port and Lighthouse attaches); no other browser is added.
Servers come from `security/local-servers.mjs`. Reports are written to
`perf/.results/` (ignored by git).

All numbers are **synthetic lab measurements** on one machine, not real-user
Core Web Vitals. Mobile is Lighthouse's default profile (simulated slow 4G,
4x CPU slowdown); desktop is its desktop profile.

## Representative pages

One per distinct runtime, not per URL (`perf/pages.mjs`): root home, gallery
(the image-heavy page) and search; dump home, an article (MDX with highlighted
code) and search; docs home, a reference page and search; lab home, the three
experiments (each loads different client code) and search. Root and Dump are Next
and rendered per request (nonce CSP); Docs and Lab are static Astro.

## Baseline (three runs each)

- **All 14 pages × 2 profiles score 95-100 in performance** wherever Lighthouse
  produces a score. The exception is the docs search page on mobile, where
  Lighthouse 13 intermittently cannot collect an LCP at all (`NO_LCP`, 11 of 13
  baseline runs) although the page renders and Chromium's own
  `PerformanceObserver` reports an LCP; see "NO_LCP" below.
- Accessibility and best practices are 100 everywhere. SEO is 100 except the
  four `/search` pages at 69: they are `noindex` on purpose (see `seo.md`), so
  Lighthouse's "blocked from indexing" audit fails by design.
- CLS 0 and TBT under 40 ms on every page. Mobile LCP is 1.2-3.0 s in the
  simulation, highest on pages whose LCP is the 36 KB search-character image or
  the gallery sheet; the unthrottled browser reports 0.1-0.2 s.
- Scores that dip below 100 are simulated-throttling variance (root gallery
  mobile ranged 95-100 over three runs with the same bytes).

First-party weight on a cold mobile load (transferred, gzip as served locally):

| App  | JS        | CSS | Font | Images    | Total     | Requests |
| ---- | --------- | --- | ---- | --------- | --------- | -------- |
| root | 153-163 K | 9 K | 33 K | 107-477 K | 313-691 K | 13-22    |
| dump | 149-150 K | 8 K | 33 K | 10-123 K  | 212-404 K | 13-23    |
| docs | 7 K       | 7 K | 32 K | 10-122 K  | 60-172 K  | 5-15     |
| lab  | 9-11 K    | 7 K | 33 K | 10-122 K  | 64-176 K  | 7-17     |

## Root's JavaScript

Root home ships **153 KB transferred, 468 KB decoded** in 7 files. About 85% is
the framework: React DOM (72 KB / 224 KB), the Next client runtime (46 KB /
162 KB), a router chunk (9 KB / 28 KB) and the bundler runtime (6 KB). Our own
code is the shared behaviour chunk (sound synthesis, search, gallery reveal;
11 KB / 30 KB) and two tiny page chunks. Splitting by route works: `/gallery`
adds one 16 KB chunk and the other pages do not load it; dump's article carries
the same framework with no extra chunk. Nothing unexpectedly large is pulled in.
This is measured from the browser's own network events (`perf/weight.mjs`), not
from source sizes. Docs and Lab ship 7-11 KB of script because they are static
Astro pages without a framework runtime.

## Search illustration

The search page showed a 640px, 94 KB PNG in a 150px slot (100px on phones),
and nothing else uses it. Since 2026-10-07 the page serves a 320px derivative
(36 KB; 2x on desktop and 3x on phones) generated from the untouched source in
`packages/design/assets/search/source/` by
`pnpm --filter @raioviajante/design search-art`. A test checks its size and that
it still matches the source, and the four `*/search` baselines in
`perf/budgets.json` dropped by about 60 KB of images and total transfer for that
reason. A 3x desktop display would show it upscaled to 150px of a 320px file;
that is rare and was judged not worth the bytes. Other artwork is unchanged.

## Budgets (`perf/budgets.json`)

- **Hard, deterministic** (`perf:check`): per page, first-party JS, CSS, font,
  image, total transfer and request count, each at the measured baseline +15% +
  4 KB (requests +3); no request to a non-local origin; no failed request; one
  self-hosted font file, downloaded once and preloaded; no image over 150 KB;
  every visible image has `width` and `height`.
- **Hard, with variance handling** (`perf:lighthouse`): performance >= 90,
  accessibility 100, best practices >= 95, SEO 100 (69 for `/search`), CLS <=
  0.02. A page below a floor is measured twice more and the median decides.
  The performance floor of **90 is a regression guard, not the goal**: the
  quality target is **95**, and a valid score from 90 to 94 passes but is
  reported as below target. The floor is not 95 because the same bytes scored
  95-100 across runs (simulated-throttling variance of up to five points).
- **Soft** (printed, never failing): FCP, LCP, TBT and Speed Index against
  generous thresholds, a performance score under the 95 target, and images much
  larger than their slot.
- Budgets are never rewritten by a tool. `node perf/check.mjs --baseline` prints
  the measurements and writes `perf/.results/suggested.json`; change the file
  by hand in a reviewed commit and say why.

## NO_LCP: when Lighthouse cannot collect an LCP

`NO_LCP` means Lighthouse found no largest-contentful-paint candidate and scored
performance 0. That is a collection failure, not a score, and it must not hide a
page that really has no LCP. So:

- **Anywhere unexpected it fails**, and a run is never dropped from the counts.
- **One exception, written in `perf/budgets.json` (`knownNoLcp`):** docs
  `/search/` on mobile. A `NO_LCP` there is accepted only while Chromium itself
  observes a real LCP entry on the page (`perf/browser-lcp.mjs`), the page has
  visible content, answers 200, and has no page error or failed first-party
  request. The proof is existence only, with no numeric threshold. If the browser
  also sees no LCP, the check fails.
- Valid Lighthouse runs of that page still count normally. The output states how
  many runs were valid and how many were `NO_LCP`. If every run is `NO_LCP` the
  page passes on the browser proof alone and **no Lighthouse score is reported**
  for it.
- `perf/lighthouse-policy.test.mjs` covers these rules with fixtures (unexpected
  NO_LCP, the exception with and without a browser LCP, scores under 90, scores
  from 90 to 94, other floors, and the exception's exact scope), so they do not
  depend on the live quirk.

## Findings

- **Fonts:** one 32 KB variable WOFF2 per app, self-hosted, preloaded exactly
  once (`next/font` in Root and Dump, an explicit link in Docs and Lab), no
  third-party font request, `font-display: optional`. Nothing was added.
- **Images:** all responses are real images; none is empty. The largest are the
  root gallery's character sheet (125 KB WebP) and the search character, the LCP
  of every search page, now the 320 px derivative described in
  [Search illustration](#search-illustration).
- No genuine performance defect was found, so no performance fix was made.

Relationship to `browser-checks.md`: `pnpm browser:check` owns accessibility
correctness (axe, keyboard, focus); Lighthouse's accessibility score here is only
a floor that must not drop. Link and resource integrity is `links.md`.
