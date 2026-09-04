# dump

> a memory dump, hopefully readable.

A personal publication for writing about things I build, learn, use, explore,
and occasionally break. Mostly computers.

## What is this?

The code behind `dump`, RaioViajante's site. A static Next.js site that turns a
folder of MDX files into a publication with an archive, tags, and an RSS feed —
somewhere to write things down while learning and building in public.

## Stack

- Next.js (App Router) and React
- TypeScript
- MDX through `@next/mdx`, with frontmatter parsed by `gray-matter`
- `rehype-pretty-code` and Shiki for build-time syntax highlighting
- `remark-gfm`, `rehype-slug`
- Jest and Testing Library

## Writing

Posts live in `content/posts/` as `.mdx` files. The filename is the slug —
`content/posts/my-post.mdx` is served at `/posts/my-post`.

Each post starts with frontmatter:

```yaml
---
title: "Post title"
description: "One or two sentences. Used for previews, meta tags, and the feed."
date: "2026-01-30"
tags:
  - a-tag
  - another-tag
draft: false
---
```

`title`, `description`, and `date` are required; `tags` and `draft` are not. A
`draft: true` post stays out of production — listings, tags, feed, sitemap — and
404s there, but still renders locally for previewing.

See `content/README.md` for the rest.

## Development

```
npm install
npm run dev
```

Node 24 (`.nvmrc`). Checks:

```
npm run lint
npm run typecheck
npm run test
npm run build
```

`npm run format` applies Prettier.

## Structure

```
app/         routes, layout, feed, sitemap
components/  the site shell and post listings
content/     posts, as MDX
lib/         content pipeline, feed, site config
tests/       Jest specs
```
