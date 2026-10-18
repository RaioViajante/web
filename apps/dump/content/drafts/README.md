# Editorial drafts

Files below this directory are authoring artifacts, not post records. The Dump
loader reads only `content/posts/`, so an undated draft cannot enter a route,
search index, sitemap, feed or social-card inventory.

For the Portuguese release in issue #47:

1. Complete editorial review here without inventing `publishedAt`.
2. On the actual production release date, add that `YYYY-MM-DD` value to both
   files and move them into `content/posts/`.
3. Regenerate the published route manifest with `pnpm content:routes`.
4. Run every required check and obtain review for that promotion commit before
   merge.

Once public, preserve each date as the localized version's first publication
date. A later edit may add `updatedAt`; it must not rewrite `publishedAt`.
