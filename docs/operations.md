# Operations

The runbook for shipping and maintaining the four sites. It lists procedures and
the order to follow them in, and links to the document that explains each check.
Nothing here has been run against GitHub or Vercel yet: everything under "First
push" and "First deploy" is an unverified checklist until someone does it, and
the repository is not claimed to be deployed.

## Local, before every push

Node comes from `.nvmrc` and pnpm from `packageManager`.

| Step                   | Command                                                                | Explained in                                       |
| ---------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| Install                | `pnpm install --frozen-lockfile`                                       | [development.md](development.md)                   |
| Main validation        | `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate`     | [ci.md](ci.md)                                     |
| Browser, accessibility | `pnpm browser:check`                                                   | [browser-checks.md](browser-checks.md)             |
| SEO over HTTP          | `pnpm seo:verify`                                                      | [seo.md](seo.md)                                   |
| Headers and CSP        | `node security/verify-http.mjs`                                        | [security-headers.md](security-headers.md)         |
| Network origins        | `ORIGINS_SKIP_THIRD_PARTY=1 pnpm security:origins`                     | [network-origins.md](network-origins.md)           |
| Performance weight     | `pnpm perf:check` (and `pnpm perf:lighthouse`, which only warns in CI) | [performance.md](performance.md)                   |
| Links                  | `pnpm links:check` (and `pnpm links:external`, observational)          | [links.md](links.md)                               |
| Dependency audit       | `pnpm audit:check`, and `pnpm audit` to read the advisories            | [security-maintenance.md](security-maintenance.md) |
| Commit messages        | `pnpm commits:check`                                                   | [ci.md](ci.md#commit-messages)                     |

The browser, SEO, header, origin, performance and link steps run against the
builds that `pnpm validate` just made. The audit needs the network and can start
failing without a commit; the only accepted advisories are in
`security/audit-exceptions.json`, with their expiry dates.

## First push

Do this once, from a branch, and open a pull request into `main` so that
everything runs on real GitHub-hosted x64 runners. Inspect:

- **`quality`**: Node and pnpm from the repository pins, `playwright install
--with-deps chromium`, the pinned Firefox and its libraries, the real run time
  against the 30-minute limit, the failure artifacts, and the commit-message
  step (its range for a pull request is base to head).
- **`dependency-audit`**: passes with the two reviewed advisories.
- **`observational (non-blocking)`**: runs after `quality`; its Lighthouse,
  live-origin and external-link results are information, never a gate.
- **CodeQL**: the SARIF upload, the same-repository and Dependabot behavior, and
  the skip for external fork pull requests ([security-maintenance.md](security-maintenance.md#codeql)).
- **Dependabot**: accepts `.github/dependabot.yml`, finds the local composite
  action, and the schedules in all workflows were accepted.

Things that may fail only because they have never run remotely: the x64 runner
image and its Firefox libraries, `--with-deps` on that image, real timings, the
CodeQL upload and Dependabot's glob for the composite action.

## GitHub settings (manual, remote)

Not done by any commit. Settings > Rules or Branches, for `main`:

- Require the checks **`quality`** and **`dependency-audit`**. Leave
  `observational (non-blocking)` optional.
- Consider CodeQL as a required check only after its first successful run, once
  the check name it actually emits is known.
- Require pull requests and block force pushes to `main`. The commit-message
  check is a step inside `quality`, so requiring `quality` requires it (a push
  whose previous commit is missing fails that step).

Settings > Actions: default workflow permissions read-only. Settings > Code
security: Dependabot alerts and security updates, secret scanning and push
protection where available, and CodeQL on **advanced setup** (this repository's
workflow), with default setup off. Merge Dependabot pull requests with a merge
commit, not squash (see [security-maintenance.md](security-maintenance.md#codeql)).

## Deploy (Vercel)

Vercel alone deploys; four projects with Root Directory `apps/<app>`, described
in [deployment.md](deployment.md) with the owner checklist of dashboard settings.
A push to `main` starts a deployment for each project.

- Wait for all four. A project whose Ignored Build Step finds nothing relevant
  shows "Canceled by Ignored Build Step"; that is the intended result, not a
  failure ([deployment.md](deployment.md#ignored-build-step)).
- Confirm the rule on the first real pushes: a change under `packages/design`,
  `security/`, `seo/` or `site/` rebuilds all four; a change under one `apps/`
  directory rebuilds only that app; docs-only changes rebuild none. Shallow clones
  that lack the previous commit always build, which is intended.

## First deploy: live checks

On each host (`raioviajante.com`, `dump.`, `docs.`, `lab.`):

- **Headers:** CSP, `Strict-Transport-Security`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Opener-Policy` as in
  [security-headers.md](security-headers.md). On root and dump, a nonce is present
  and differs between two requests. Run SecurityHeaders.com and Mozilla
  Observatory for a second opinion.
- **security.txt:** `/.well-known/security.txt` over HTTPS, the expected body and
  canonical, and `Content-Type: text/plain; charset=utf-8`
  ([security-txt.md](security-txt.md)). The Astro preview omits the charset, so
  look at the real response.
- **Routing and SEO:** `www` redirects to the apex; canonical hosts; Docs and Lab
  trailing-slash behavior; a missing page answers 404 and is `noindex`; `/search`
  is `noindex, follow` and absent from the sitemap; live `sitemap.xml`,
  `robots.txt` and dump's `rss.xml` ([seo.md](seo.md)).
- **Privacy:** no `rv-sound` cookie before an interaction; after turning sound on,
  `Domain=.raioviajante.com; Path=/; Secure; SameSite=Lax`
  ([privacy-storage.md](privacy-storage.md)).
- **Giscus on dump:** GitHub sign-in and the OAuth return, the `giscus-session`
  behavior, posting a comment, a populated discussion, and the frame's network
  requests ([network-origins.md](network-origins.md)).
- **Vercel:** root and dump render dynamically, caching headers are as intended,
  and no unexpected Vercel client script or analytics is injected.

HSTS preload: the header carries the `preload` token, but submitting the domain to
the preload list is a separate decision. Evaluate it only once every subdomain is
proven to serve HTTPS, and it is hard to undo; it is not required.

Search Console and Bing Webmaster Tools are optional; sites are indexable without
submitting anything.

## Scheduled maintenance

| What                 | When                                                         | How                                                                                       |
| -------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| security.txt renewal | before the window opens on 2027-09-01 (`Expires` 2027-10-01) | [security-txt.md](security-txt.md#renewal); the guard fails inside 30 days                |
| Audit exceptions     | before 2026-12-06 (braces, sprintf-js)                       | re-run `pnpm audit`, then remove or renew in `security/audit-exceptions.json`             |
| Scheduled workflows  | weekly Monday (maintenance) and Wednesday (CodeQL)           | GitHub disables schedules after about 60 days without activity: review by hand            |
| Dependabot (actions) | weekly                                                       | review the pull request; pnpm packages are reviewed by hand until GitHub supports pnpm 12 |

## Recovery

The repository does not configure a rollback mechanism and none has been
exercised. What is factual: `main` is only changed through reviewed, CI-checked
pull requests, so a bad change is undone by merging a revert, which Vercel then
deploys like any other commit. Vercel itself offers ways to redeploy an earlier
deployment, but this repository neither depends on nor documents that, and it has
not been tried here.

## Deferred and accepted

| Item                                                | Status                                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Dependabot for pnpm packages                        | Accepted limitation; re-evaluate when GitHub supports pnpm 12                                                      |
| Legal facts for dump, docs, lab                     | Omitted on purpose until the owner supplies them ([design-migration-plan.md](design-migration-plan.md) lists them) |
| 404 sticker (190 KB PNG, 640px)                     | Accepted: shown at 300px, so 2x is covered; only on error pages                                                    |
| Search illustration at 3x desktop                   | Accepted: 320px source for a 150px slot                                                                            |
| Unused artwork `head-box.png`, `work-of-art-pt.png` | Owner decision whether to keep                                                                                     |
