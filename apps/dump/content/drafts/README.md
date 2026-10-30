# Editorial drafts

Files below this directory are authoring artifacts, not post records. The Dump
loader reads only `content/posts/`, so an undated draft cannot enter a route,
search index, sitemap, feed or social-card inventory.

## Publication procedure

A draft of a translation carries the original's `publishedAt`, which is already
on record; it needs no release date of its own. The rest of this section applies
to a new original.

Before promoting a new original, obtain the specific owner-approved production
release date in the project's established publication timezone. Add that date
as `publishedAt`, set `draft: false`, move the record into `content/posts/`,
regenerate `lib/published-routes.generated.ts`, and run the complete release
checks. Do not publish with a placeholder date or infer one from repository
history.

Once public, preserve the date as the work's first publication date, shared by
every version. A later edit may add `updatedAt`; it must not rewrite `publishedAt`.
