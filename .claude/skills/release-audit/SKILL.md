---
name: release-audit
description: Verify that an approved, merged change to RaioViajante/web actually reached production on raioviajante.com, dump, docs and lab - main SHA, merge commit, post-merge CI, Vercel deployment per project, live URLs, HTTP status, RSS, search indexes, sitemap, localization and security headers. Read-only; reports observed evidence, pending work and external blockers separately. Use after a merge or when asked "is it live?".
argument-hint: "[PR number or commit SHA]"
---

# release-audit

Read-only. Nothing here merges, deploys, redeploys, changes settings or edits
files. Mechanisms are documented in `docs/deployment.md`, `docs/operations.md`
("First deploy: live checks"), `docs/ci.md`, `docs/seo.md`,
`docs/security-headers.md` and `docs/security-txt.md`; do not restate them, apply them.

Core rule: **merged is not deployed, and a preview is not production.** Each
claim in the report needs its own evidence, and an unchecked link in the chain is
"unverified", never "presumably fine".

## 1. Establish what should be live

```sh
git fetch origin
git rev-parse origin/main
gh pr view <n> --json state,mergedAt,mergeCommit,headRefOid,baseRefName,files
git diff --name-only <merge-commit>^1 <merge-commit>
```

- Current `origin/main` SHA, the PR's merge commit and whether the merge commit
  is an ancestor of `origin/main` (`git merge-base --is-ancestor`). Later
  commits may have landed; say so.
- From the changed paths derive which projects *should* rebuild. Vercel decides
  with `security/vercel-ignore.mjs` (see `deployment.md`): shared paths
  (`packages/design`, `security/`, `seo/`, `site/`) rebuild all four; one app
  directory rebuilds that app; docs-only rebuilds none. "Canceled by Ignored
  Build Step" is the correct outcome for an unaffected project, not a failure.

| Domain | Vercel project | Root Directory |
| --- | --- | --- |
| raioviajante.com | `raioviajante.com` | `apps/root` |
| dump.raioviajante.com | `dump` | `apps/dump` |
| docs.raioviajante.com | `docs` | `apps/docs` |
| lab.raioviajante.com | `lab` | `apps/lab` |

(Confirm against `docs/deployment.md`; if it has changed, that doc wins.)

## 2. Post-merge CI on that SHA

```sh
gh run list --branch main --json headSha,name,status,conclusion,url --limit 10
gh run view <id> --log-failed
```

Find the push-to-`main` run whose `headSha` equals the commit under audit.
Required: `quality` and `dependency-audit`. `observational (non-blocking)` and
CodeQL are informational. A green PR run is not post-merge evidence: the merge
commit is a different SHA. Still running means pending, not passed.

## 3. Deployment status

Sources, best first; use whichever you are authorized for:

- GitHub deployments/statuses: `gh api repos/RaioViajante/web/commits/<sha>/status`
  and `.../deployments` (Vercel reports per-project statuses and URLs).
- The Vercel plugin/CLI (`vercel:status`, `vercel ls`, `vercel inspect`) if
  linked and authenticated.
- Live fingerprint (below) when neither is available.

Per project record: expected to build? deployment id/URL, commit SHA it built,
state (building, ready, error, canceled), environment (**Production**, not
Preview). A Preview deployment for the PR branch does not count as production.
If a deployment errored or is missing, capture the error text; do not infer a
cause you have not read.

Do not trigger redeploys, push empty commits, re-run builds repeatedly, or work
around plan limits or rate limits (for example Vercel's deployment quota). If a
quota blocks a deploy, report it as an external blocker with the message, and
let the owner decide.

## 4. Verify production URLs

`bash ${CLAUDE_SKILL_DIR}/scripts/probe.sh [root|dump|docs|lab ...]` makes one
request per URL (statuses, content types, security headers). Keep requests few;
no loops, no retries against a failing host. Then check, for the hosts the
change affects:

- **Content actually changed**: fetch a page or asset the PR altered and find a
  string unique to it. A 200 from an old build proves nothing. A cached copy
  (`age`, `x-vercel-cache`) can lag: note it and re-check once later rather than
  hammering.
- **Status and routing**: key pages 200; a nonexistent path 404 with the site's
  404 page; `www` redirects (308) to the apex; Docs and Lab trailing-slash
  behavior; removed routes 404 without redirects.
- **Sitemap**: `/sitemap.xml` lists new/removed pages in both languages with
  matching `hreflang` alternates; `/search` absent and `noindex, follow`.
- **Search indexes**: `/search-index.json` and `/pt/search-index.json` contain
  the new entries and not drafts or removed works.
- **RSS (dump)**: `/rss.xml` and `/pt/rss.xml` list their own locale's items,
  with the original's `pubDate` and the right GUIDs.
- **Localization**: `/pt/...` counterparts return 200, `html lang` is
  `en` / `pt-BR`, canonical and `hreflang` are reciprocal, nothing Portuguese
  serves English fallback.
- **Security**: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, COOP as in `docs/security-headers.md`; Root and Dump send
  a per-request nonce (two requests differ); `/.well-known/security.txt` has the
  expected body, canonical and content type; no `rv-sound` cookie before
  interaction; no unexpected third-party scripts.
- **Regression**: re-check two or three unrelated pages per affected host, and
  the other hosts' homepage, to see nothing else broke. For heavier assurance,
  run the repository's HTTP checks against production origins only if the
  script supports it and the user agrees (`seo:verify` and `verify-http`
  default to local servers; do not point them at production by editing them).

Browser-based checks of production (rendering, console errors) are allowed with
read-only navigation. Never submit forms or post giscus comments.

## 5. Report

Use these headings; omit none, write "none" where empty.

1. **Audited**: target PR/commit, `origin/main` SHA at audit time, timestamp.
2. **Observed evidence**: facts with the command/URL and result (status codes,
   SHAs, deployment ids, header values, matched strings). Only things seen.
3. **Not verified**: anything not checked and why (no Vercel access, still
   building, cache not yet refreshed).
4. **Pending work**: things that will resolve on their own or need a repo
   change (deployment in progress, follow-up PR, schedule).
5. **External blockers**: provider quotas, outages, dashboard settings, DNS -
   quote the message; owner action needed. Do not circumvent.
6. **Verdict** per project: `live and verified`, `live, partially verified`,
   `not live`, `not expected to deploy (ignored build step)`, or `unknown`.
   "Merged" alone is never a verdict of live.

If production disagrees with the expected state, report the discrepancy and the
evidence. Propose options (wait, owner redeploy, revert PR through `safe-pr`)
but take none without the user's instruction.
