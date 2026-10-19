# Editorial drafts

Files below this directory are authoring artifacts, not post records. The Dump
loader reads only `content/posts/`, so an undated draft cannot enter a route,
search index, sitemap, feed or social-card inventory.

## Publication procedure

Before promoting a manuscript, obtain the specific owner-approved production
release date in the project's established publication timezone. Add that date
as `publishedAt`, set `draft: false`, move the record into `content/posts/`,
regenerate `lib/published-routes.generated.ts`, and run the complete release
checks. Do not publish with a placeholder date or infer one from repository
history.

Once public, preserve each date as the localized version's first publication
date. A later edit may add `updatedAt`; it must not rewrite `publishedAt`.
