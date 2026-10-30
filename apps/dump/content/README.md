# content

Posts live in `content/posts/` as `.mdx` files. One file is one article.

## Publishing a post

1. Create `content/posts/<slug>.mdx`. The filename is the URL:
   `content/posts/booting-512-bytes.mdx` → `/posts/booting-512-bytes`.
2. Add frontmatter (below) and write the article. Start body headings at `##`
   — the `#` (h1) is the post title, rendered from frontmatter.
3. Commit and push. See `docs/production-origin.md` for how this ships.

No React files need to change.

### Filename rule

Lowercase letters, digits, and hyphens only (e.g. `my-first-boot-sector.mdx`).
A filename outside that rule fails the build.

## Frontmatter

```yaml
---
contentId: "booting-512-bytes"
locale: "en"
originalLocale: "en"
title: "I Wrote 512 Bytes and Somehow It Booted"
description: "My first steps into x86 real mode and boot sectors."
publishedAt: "2026-09-03"
updatedAt: "2026-10-05"
tags:
  - osdev
  - x86
  - assembly
draft: false
---
```

| Field            | Required | Notes                                                                                           |
| ---------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `contentId`      | yes      | Stable, immutable identity of the work: lowercase letters, digits, hyphens. Declared, never derived. |
| `locale`         | yes      | The language of this version (`en`, `pt-BR`).                                                   |
| `originalLocale` | yes      | The language the work was first written in. Identical on every version of the work.             |
| `title`       | yes      | Non-empty string.                                                     |
| `description` | yes      | One or two sentences. Used in previews, `<meta>`, and RSS.            |
| `publishedAt` | yes      | Original publication date, `YYYY-MM-DD`.                              |
| `updatedAt`   | no       | Meaningful revision date, `YYYY-MM-DD`, later than `publishedAt`.     |
| `tags`        | no       | Stable tag ids (see Tags). Lowercase letters, digits, hyphens. `[]` is fine. |
| `draft`       | no       | `true` hides the post everywhere and 404s it in production.           |

Invalid frontmatter fails the build with a message naming the file and field.
Dates are explicit content metadata: builds and Git history never supply or
replace them. `publishedAt` remains the authority for ordering and RSS;
`updatedAt` is used only for revision-aware article and sitemap metadata.

### Content identity

- `contentId` is the identity of the work, not of a file or URL. All versions
  of one work (the original and any translations) share it. It never changes,
  even if the slug, title or filename does, and nothing derives it from them.
  The current English posts use their original slug as their `contentId`; that
  is a one-time migration value, not a rule for future posts.
- `originalLocale` never changes and every version carries the same value.
  Exactly one version must be in that locale, so provenance is always on
  record. That version may be `draft: true`: withdrawing or hiding an original
  keeps its provenance, and a published translation stays valid.
- A work needs no translation in every locale. English-only and
  Portuguese-only works are valid. Two versions of one work may not share a
  `locale`, and the build fails with a message naming the `contentId`, the
  locale and the files involved.
- The filename currently determines a version's slug (and so its URL). The
  slug is route identity only; it is never used to decide that two versions are
  the same work. A translation has its own filename and slug.
- `updatedAt` and `draft` belong to each localized version and are never
  copied between versions or inferred from Git, the filesystem or the build.
  `publishedAt` is the exception: it is the original's date and identical in
  every version of the work (see Date authority). Portuguese routes exist under `/pt`; only published Portuguese
  records enter them.

### Date authority

`publishedAt` is the canonical editorial record of when an article was first
made public. A commit, author, or filesystem timestamp records repository
activity, which may happen before or after publication, so it is not an
alternative publication date. Correct `publishedAt` only when independent
publication evidence supports the change; otherwise preserve the recorded
date rather than infer or redistribute dates.

A translation is not a new publication. Every version of a work, in either
language, carries the `publishedAt` of the original, also when the original is
Portuguese and the English version came later. The original's date is the one
already recorded in its own frontmatter.

Use `updatedAt` for a later meaningful change to the article's facts or prose.
Metadata cleanup, taxonomy changes, repository migrations, and automated
changes do not establish a content update on their own.

### Tags

Frontmatter `tags` are stable tag ids defined in `content/tags.json` and read
through `lib/tags.ts`. Each id has, per locale, a display label and a URL slug.
English labels and `/tags/<id>` URLs stay unchanged. A post's tags must each
have a presentation in the post's own locale, or the build fails; there is no
English fallback. Filtering uses the id; a localized slug only routes to it,
and no slug identifies a tag. Adding or localizing a tag means editing the JSON
definition. A declared slug is an NFC-normalized decoded path segment. Unicode
and reserved characters are encoded exactly once in its URL; path separators,
percent signs, whitespace and malformed Unicode are not valid slug data.
English tag lookup remains case-insensitive for historical compatibility.
Portuguese lookup is exact, and canonical URLs come from the declared
presentation rather than request text.

### Series

Series (`lib/post-details.ts`) list `contentIds` in reading order, so every
localized version of a part belongs to its series. Series are not derived from
tags. The home page shows only the parts that exist in the page's locale and
omits the section when there are none.

### Translations

Every English-original post has a Portuguese version, and the Portuguese
original has an English version. A new translation gets its own file, its own
slug in its own language, the work's `contentId`, `originalLocale` unchanged,
and `publishedAt` copied from the original: a translation is not a new
publication, so every version of a work has the same `publishedAt` (the build
fails otherwise), including an English translation of a Portuguese original.
`updatedAt` stays unset unless there is an explicit material update. Tags are ids, so the translation carries the same list, and each id
needs a presentation in the translation's locale (`content/tags.json`). The
translation contains everything its original contains: same headings, code
blocks, links and directives, in the same order. Code stays verbatim; natural
language inside code comments and short quoted prose in `text` fences is
translated. A new English item uses the non-legacy tag GUID in the feed.

### Drafts

A `draft: true` post is excluded from every public route and inventory,
including the homepage, archive, tag pages, RSS, sitemap and search. Its route
returns 404 until the record is published.

The request proxy checks dynamic membership against the generated published
inventory; it never scans MDX per request. It compares decoded route segments
so established English URLs using percent-encoded unreserved characters still
resolve, and English tag slugs remain case-insensitive. Portuguese tag slugs
use their exact declared case. Encoded separators, residual percent escapes,
invalid percent encodings, drafts and unknown slugs are localized 404s. Next.js
normalizes repeated separators and one trailing slash before the proxy with its
established 308; a missing normalized destination then returns the localized
404. No alias or new canonical is introduced.

An article whose truthful first-publication date is not known yet cannot be a
post record, because `publishedAt` remains required even for a draft. Prepare
such work in `content/drafts/<locale>/`; that directory is never loaded by the
site. On the actual release date, add `publishedAt`, move the file into
`content/posts/`, regenerate the route manifest with `pnpm content:routes`, and
run the full release checks before merge.

## Markdown support

Standard Markdown plus GitHub-flavored tables and strikethrough, automatic
heading IDs, and build-time syntax highlighting for fenced code blocks.
Fences accept the soft-block options (`title="…"`, `showLineNumbers`,
`{8-9}`, `terminal`, `group`), and `:::note`-style callouts work; see
[`docs/blocks.md`](../../../docs/blocks.md). Posts are plain Markdown plus
these blocks: they are compiled without a components map.

The one piece of raw markup a post may use is the inline
`<span lang="en">…</span>`, to mark a title or phrase in English inside a
Portuguese text so assistive technology reads it in the right language. Use it
only in prose, never in a heading, and never around code, file names,
identifiers, commands, project names or loanwords that read as Portuguese
(deadline, retry, parser). A test enforces this. See
[`docs/i18n.md`](../docs/i18n.md) for the policy and for how a sentence that
later became false is corrected without rewriting the post.

## License

Articles here are Copyright RaioViajante, all rights reserved — not covered
by the repository's MIT license, which applies only to the source code. See
the root [`LICENSE`](../LICENSE).

## If this directory is ever empty

Posts are read from disk at build time, so an empty directory builds an empty
site. A placeholder file whose name starts with `_` or `.` is ignored by
`isPostFile()` in `lib/posts.ts`.
