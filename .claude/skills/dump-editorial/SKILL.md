---
name: dump-editorial
description: Integrate an author-approved personal essay into Dump (dump.raioviajante.com) without rewriting it - MDX file, frontmatter, contentId, locale-specific slugs, tags, publication date, translation parity, search, RSS and SEO checks. Use when adding or translating a post, fixing post metadata, or reviewing a post PR. Preserves the author's voice; never publishes without approval.
argument-hint: "[post slug or manuscript path]"
---

# dump-editorial

Technical rules: `apps/dump/content/README.md` (frontmatter, identity, dates,
tags, translations, drafts, retiring), `apps/dump/docs/i18n.md`,
`docs/i18n.md`, `docs/seo.md`. Git/PR flow: `safe-pr`. Read the README first;
this skill adds the editorial discipline around it.

## The author's voice (reference, not a style to impose)

First person, conversational and natural; personal and thoughtful; subtle
humor; emotional honesty; short paragraphs; no generic motivation, no
unnecessary technical exposition. Read two or three published posts in
`content/posts/` before touching anything, so you know what the voice is.

## Hard rules

1. **Approved manuscripts are fixed.** Do not rewrite, "improve", shorten,
   re-order, retitle or re-tone approved text. Changes to the author's words
   are the author's. Mechanical fixes (frontmatter, heading level, a broken
   link target, `lang` spans) are allowed and listed in the PR. If you think
   a sentence is wrong or a fact stale, say so in the report and leave it.
2. **Never invent** personal events, people, places, feelings, dates, health or
   other private information. Never fill a gap in a story. Never add
   a closing moral or motivational line.
3. **No publishing without authorization.** Opening a PR is not publishing;
   merging is, and needs the user's explicit instruction (`safe-pr` section 9).
   Use `draft: true` or `content/drafts/<locale>/` while approval or the truthful
   `publishedAt` is missing.
4. **Original vs translation is a recorded fact.** Know which language the
   author wrote first; that locale is `originalLocale` on every version.

## 1. Intake

Ask or confirm, in one question if anything is missing: manuscript source and
language; approval status; truthful first-publication date (`YYYY-MM-DD`);
title and description (author's, or flagged as proposed); tags; whether a
translation is wanted now. Do not guess the date from Git, the clock or the
filesystem: `publishedAt` is editorial authority (README "Date authority").

## 2. Original post

- File `content/posts/<slug>.mdx`; slug is lowercase letters, digits, hyphens
  and is the URL: a Portuguese original gets a Portuguese slug (see
  `nao-existe-printf-aqui-embaixo`). Slugs are route identity only.
- Frontmatter: `contentId` (new, immutable, kebab-case; a one-time choice, not
  derived later), `locale`, `originalLocale` (same), `title`, `description`
  (one or two sentences, also used in previews, `<meta>` and RSS), `publishedAt`,
  optional `updatedAt` (never on a new post), `tags`, `draft`.
- Body headings start at `##`. Body text is copied verbatim from the approved
  manuscript. Markdown plus soft-block options only; no components map. Inline
  `<span lang="en">` only for English titles or phrases in Portuguese prose, not
  in headings, code, identifiers or loanwords (a test enforces it).
- Tags: existing ids from `content/tags.json`. A new tag needs a label and slug
  in both locales in the JSON; ask the author for tag choices rather than
  inventing them, and keep `personal`-style tags consistent with similar posts.
- If it belongs to a series (`lib/post-details.ts`) or links to Lab
  (`lib/lab-suggestions.ts`), update those deliberately.
- After adding or removing a post: `pnpm content:routes` regenerates
  `published-routes.generated.ts` (generated; never hand-edit).

## 3. Translation

A translation is a different file with its own slug and the same `contentId`.

- `locale` is the target; `originalLocale` unchanged; `publishedAt` copied from
  the original (a translation is not a publication - the build fails otherwise);
  `updatedAt` unset unless there is a real material update; same `tags`, each
  with a presentation in the target locale.
- Fidelity: everything the original contains, same order: headings, paragraphs,
  code blocks, links, directives, callouts. Keep tone, rhythm and short
  paragraphs; keep jokes working in the target language rather than translating
  them word by word, and flag any joke or idiom that does not carry over
  instead of silently replacing it. Code verbatim; natural-language comments
  inside code and quoted prose in `text` fences are translated. Outbound links
  point to the page language's site (`/pt` trees); only the `href` changes.
- Policy: `docs/i18n.md` states localized text is authored by hand, no machine
  translation. So translate only when the author asks, deliver it as a **draft
  for the author's review** (`draft: true` on the translation, original may stay
  published), say plainly it is unapproved, and let the author or a Brazilian
  Portuguese reader approve before `draft` is removed. Never mark your own
  translation approved. Translating Portuguese to English is the same.
- Never "correct" the original while translating. Report discrepancies.

## 4. Checks

```sh
pnpm --filter @raioviajante/dump format:check
pnpm --filter @raioviajante/dump lint
pnpm --filter @raioviajante/dump typecheck
pnpm --filter @raioviajante/dump test
NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm --filter @raioviajante/dump build
```

Tests encode the contract: content identity, translation parity, coverage
matrix, retired content, tags, RSS identity, search. Expected updates to
inventory-style tests (counts, coverage, post lists) are part of the change;
read each diff in them rather than regenerating blindly. Then, on your own
build and a port you started: `pnpm seo:verify`, `pnpm links:check`,
`pnpm browser:check` (axe, overflow, 1440/390).

Spot-check the built output in both locales:

- the post renders at its slug, one `h1` (the title), correct `lang`;
- listed on home, archive and its tag pages; absent when `draft: true`;
- `rss.xml`: item with the original's `pubDate`; a new English item uses the
  non-legacy GUID; Portuguese feed per `docs/i18n.md`;
- `search-index.json` contains it (and not drafts);
- sitemap entry with `hreflang` counterparts and `lastmod` only from `updatedAt`;
- canonical, Open Graph `locale`, JSON-LD `datePublished`;
- comments identity (giscus) keyed by `contentId` - never rename one.

## 5. Report

State: originals vs translations, what was copied verbatim, mechanical edits,
anything flagged for the author (facts, idioms, dates, tags), draft/publish
state, checks run, and that nothing was merged or published.
