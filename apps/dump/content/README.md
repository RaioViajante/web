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
date: "2026-09-03"
tags:
  - osdev
  - x86
  - assembly
draft: false
---
```

| Field         | Required | Notes                                                        |
| ------------- | -------- | ----------------------------------------------------------- |
| `title`       | yes      | Non-empty string.                                           |
| `description` | yes      | One or two sentences. Used in previews, `<meta>`, and RSS.  |
| `date`        | yes      | `YYYY-MM-DD`. Treated as UTC, so it never shifts by a day.  |
| `tags`        | no       | Lowercase letters, digits, hyphens. Lowercased for you. []. |
| `draft`       | no       | `true` hides the post everywhere and 404s it in production. |

Invalid frontmatter fails the build with a message naming the file and field.

### Drafts

A `draft: true` post is excluded from the homepage, archive, tag pages, RSS, and
the sitemap. `next dev` still renders it at its real URL so you can preview it;
production returns 404 until you set `draft: false`.

## Markdown support

Standard Markdown plus GitHub-flavored tables and strikethrough, automatic
heading IDs, and build-time syntax highlighting for fenced code blocks. React
components can be imported directly into an `.mdx` file when needed.

## License

Articles here are Copyright RaioViajante, all rights reserved — not covered
by the repository's MIT license, which applies only to the source code. See
the root [`LICENSE`](../LICENSE).

## If this directory is ever empty

The bundler needs at least one `.mdx` file here to compile the post route. If
every post is ever removed, add a placeholder file (filename starting with
`_` or `.` so `isPostFile()` in `lib/posts.ts` excludes it from listings)
until a real one exists again.
