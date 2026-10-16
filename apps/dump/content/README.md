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

| Field         | Required | Notes                                                                 |
| ------------- | -------- | --------------------------------------------------------------------- |
| `title`       | yes      | Non-empty string.                                                     |
| `description` | yes      | One or two sentences. Used in previews, `<meta>`, and RSS.            |
| `publishedAt` | yes      | Original publication date, `YYYY-MM-DD`.                              |
| `updatedAt`   | no       | Meaningful revision date, `YYYY-MM-DD`, later than `publishedAt`.     |
| `tags`        | no       | Lowercase letters, digits, hyphens. Lowercased for you. `[]` is fine. |
| `draft`       | no       | `true` hides the post everywhere and 404s it in production.           |

Invalid frontmatter fails the build with a message naming the file and field.
Dates are explicit content metadata: builds and Git history never supply or
replace them. `publishedAt` remains the authority for ordering and RSS;
`updatedAt` is used only for revision-aware article and sitemap metadata.

### Date authority

`publishedAt` is the canonical editorial record of when an article was first
made public. A commit, author, or filesystem timestamp records repository
activity, which may happen before or after publication, so it is not an
alternative publication date. Correct `publishedAt` only when independent
publication evidence supports the change; otherwise preserve the recorded
date rather than infer or redistribute dates.

Use `updatedAt` for a later meaningful change to the article's facts or prose.
Metadata cleanup, taxonomy changes, repository migrations, and automated
changes do not establish a content update on their own.

### Drafts

A `draft: true` post is excluded from the homepage, archive, tag pages, RSS, and
the sitemap. `next dev` still renders it at its real URL so you can preview it;
production returns 404 until you set `draft: false`.

## Markdown support

Standard Markdown plus GitHub-flavored tables and strikethrough, automatic
heading IDs, and build-time syntax highlighting for fenced code blocks.
Fences accept the soft-block options (`title="…"`, `showLineNumbers`,
`{8-9}`, `terminal`, `group`), and `:::note`-style callouts work; see
[`docs/blocks.md`](../../../docs/blocks.md). Posts are plain Markdown plus
these blocks: they are compiled without a components map.

## License

Articles here are Copyright RaioViajante, all rights reserved — not covered
by the repository's MIT license, which applies only to the source code. See
the root [`LICENSE`](../LICENSE).

## If this directory is ever empty

Posts are read from disk at build time, so an empty directory builds an empty
site. A placeholder file whose name starts with `_` or `.` is ignored by
`isPostFile()` in `lib/posts.ts`.
