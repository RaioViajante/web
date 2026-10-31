---
name: docs-author
description: Write or update public technical documentation pages for docs.raioviajante.com (apps/docs) in English and Brazilian Portuguese, grounded in source-level research of the documented project. Use when adding a project page, an API/architecture/security/design page, updating one after the source changed, or auditing a page's claims. Enforces implemented-vs-planned status, privacy boundaries, EN/PT-BR parity and evidence records.
argument-hint: "[project or page]"
---

# docs-author

Authoritative rules live in `apps/docs/AGENTS.md`, `apps/docs/docs/content.md`
(information architecture, `contentId` table, legal-page rules),
`apps/docs/docs/design.md`, `docs/i18n.md`, `docs/blocks.md` and `docs/seo.md`.
Read them first; this skill is the workflow. Use `safe-pr` for Git and PRs.

Docs is curated, factual and technical. Personal or editorial writing belongs in
Dump. Never put public content in either `docs/` directory, nor maintenance
notes in `src/content/docs/`.

## 1. Scope and access

- Name the page and the project. Confirm it deserves publication: content is
  promoted deliberately, never mirrored from a project's internal docs.
- Use only sources you are authorized to read: public repositories, local
  sibling clones the owner provided, or material the user supplied. Sibling
  repositories are read-only evidence: do not build, install or generate
  anything inside them.
- Record the exact source revision (commit SHA) you read. Existing pages cite
  one in their evidence file.
- **Accessible is not publishable.** A private repository, an internal
  endpoint, a schema, config value, hostname, credential, customer detail or
  unreleased roadmap item stays out of the page, the evidence file, the PR text
  and the commit message, even if you could read it. If a private component must
  be mentioned, say only what an existing public document already says, and ask
  the user when unsure. Check public visibility unauthenticated before linking a
  repository.

## 2. Research

Trace claims to code, not to READMEs alone: entry points, manifests, config
defaults, tests, ADRs, CI. For each claim collect file path plus revision.
Prefer running read-only commands that exist (`--help`, existing tests) only if
the user allows executing project code; otherwise say tests were read, not run.

Classify every claim (this vocabulary matches existing evidence files):

| Status | Meaning | May the page say it in present tense? |
| --- | --- | --- |
| implemented | present in code at the cited revision, exercised by tests or verified use | yes |
| partial | exists with documented limits | yes, with the limit stated beside it |
| experimental | behind a flag, unstable or unreleased | only labeled as such |
| planned | stated intent, design doc or issue, no code | only under an explicit "planned" label, or omitted |
| unverified | could not be confirmed | no: omit it and list it in the report |

Never describe a planned capability as shipped. Design documents and ADRs
describe intent and may predate code (an existing evidence file notes an ADR
that lags the code): the code wins, and the page follows the code. Omit unknown
facts (versions, dates, support matrices, limits); do not estimate or invent.
Observed facts (for example an HTTP header) carry the observation date.

## 3. Evidence record

Create or update `apps/docs/docs/sources/<project>.md` (maintenance, unpublished)
following the existing files there: sources and revisions, what was not run,
link rules, a claim table (claim, status, evidence), and a "Re-verifying"
section. Every number, limit, name and behavior on the page needs a row.
The file contains no private detail either.

## 4. Writing the English page

- Location: `apps/docs/src/content/docs/<section>/...`; frontmatter per
  `src/content.config.ts`, including `contentId`, `locale`, `originalLocale` and
  the public `path`. New project pages: overview plus one focused page, like the
  existing projects. A project gaining `contentId: projects/<id>` replaces its
  external row on the home page automatically.
- Match the structure and tone of a sibling page of the same kind (CLI
  reference, architecture, API, security, design record). Technical examples
  must be correct for the cited revision; copy commands and output from the
  source or tests, never reconstruct them from memory. Mark non-runnable
  snippets honestly.
- Callouts `:::note`, `:::important`, `:::warning`; code fences use soft-block
  options from `docs/blocks.md`. One h1, ordered headings, descriptive link
  text, no placeholder text on a public page, no decorative icons.
- Security-sensitive projects: describe the public design and guarantees only
  as far as public sources state them; do not publish exploit detail or
  unfixed weaknesses.

## 5. Brazilian Portuguese parity

Each English page needs a Portuguese version under `src/content/docs/pt/` with
the same `contentId`, `originalLocale`, its own localized `path`, and its own
authored body. Never an English fallback. The parity test compares headings,
callouts, tables, lists, paragraphs, code blocks and links, and rejects standalone English words
(including in link targets), so mind link targets (see the Mochifile evidence
note). Keep identifiers, commands, flags and code verbatim; translate prose and
code comments. Follow the vocabulary in existing `pt/` pages and
`docs/i18n.md`.

Policy tension to respect: `docs/i18n.md` says localized text is authored by
hand with no machine translation, while `content.md` records some Portuguese
legal pages as AI translations pending owner review. Draft Portuguese for the
owner's review, say plainly in the report that it is a draft needing a
Brazilian Portuguese reader, and never touch legal texts without owner review.

## 6. Integration

- Navigation: sidebar and breadcrumbs derive from content and `src/lib/nav.ts`;
  update the `content.md` information-architecture block and `contentId` table.
- Search: the index is generated (`/search-index.json`); the new page appears
  after a build. Check the `docs/search` budget in `perf/budgets.json`: it grows
  with content. A raise is a reviewed commit with its reason (see the earlier
  `perf(docs)` commit), never a silent edit.
- SEO: sitemap, canonical, `hreflang` pairs come from the registry; verify with
  `pnpm seo:check` and, against a build, `pnpm seo:verify`.
- Accessibility: `pnpm browser:check` covers each sitemap page at 1440 and 390.

## 7. Validate

```sh
pnpm --filter @raioviajante/docs typecheck
pnpm --filter @raioviajante/docs test
pnpm --filter @raioviajante/docs build
```

Plus the shared checks the change touches (`safe-pr` section 4). Docs has no
lint or format scripts: match existing tab indentation.

## 8. Report

List separately: implemented claims published, claims left out as
unplanned/unverified, private material deliberately excluded, what was not run,
Portuguese review needed, and any contradiction found between sources and docs.
