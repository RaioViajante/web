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

- **All 14 pages × 2 profiles score 95-100 in performance** except one: the docs
  search page on mobile, where Lighthouse intermittently cannot compute LCP
  (`NO_LCP`, 11 of 13 runs) although the browser reports ~180 ms. Unexplained
  Lighthouse artifact; those runs are ignored for the performance floor and
  noted in the output.
- Accessibility and best practices are 100 everywhere. SEO is 100 except the
  four `/search` pages at 69: they are `noindex` on purpose (see `seo.md`), so
  Lighthouse's "blocked from indexing" audit fails by design.
- CLS 0 and TBT under 40 ms on every page. Mobile LCP is 1.2-3.0 s in the
  simulation, highest on pages whose LCP is the 94 KB search-character image or
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

## Budgets (`perf/budgets.json`)

- **Hard, deterministic** (`perf:check`): per page, first-party JS, CSS, font,
  image, total transfer and request count, each at the measured baseline +15% +
  4 KB (requests +3); no request to a non-local origin; no failed request; one
  self-hosted font file, downloaded once and preloaded; no image over 150 KB;
  every visible image has `width` and `height`.
- **Hard, with variance handling** (`perf:lighthouse`): performance >= 90,
  accessibility 100, best practices >= 95, SEO 100 (69 for `/search`), CLS <=
  0.02. A page below a floor is measured twice more and the median decides.
- **Soft** (printed, never failing): FCP, LCP, TBT and Speed Index against
  generous thresholds, and images much larger than their slot.
- Budgets are never rewritten by a tool. `node perf/check.mjs --baseline` prints
  the measurements and writes `perf/.results/suggested.json`; change the file
  by hand in a reviewed commit and say why.

## Findings

- **Fonts:** one 32 KB variable WOFF2 per app, self-hosted, preloaded exactly
  once (`next/font` in Root and Dump, an explicit link in Docs and Lab), no
  third-party font request, `font-display: optional`. Nothing was added.
- **Images:** all responses are real images; none is empty. The largest are the
  root gallery's character sheet (125 KB WebP) and the **search character**
  (94 KB PNG, 640 px intrinsic, shown at 100 px, the LCP of every search page).
  That is artwork: a smaller derivative would save about 70 KB per search visit,
  but it needs a decision from you, so it is reported, not changed.
- No genuine performance defect was found, so no performance fix was made.

Relationship to Phase 10A: `pnpm browser:check` owns accessibility correctness
(axe, keyboard, focus); Lighthouse's accessibility score here is only a floor
that must not drop. Link and resource integrity is `links.md`.
