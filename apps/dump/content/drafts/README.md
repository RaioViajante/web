# Editorial drafts

Files below this directory are authoring artifacts, not post records. The Dump
loader reads only `content/posts/`, so an undated draft cannot enter a route,
search index, sitemap, feed or social-card inventory.

## Issue #47 publication checklist

The two records can be promoted together in one reviewed commit; no schema
change or placeholder date is needed. Schedule the production release first.
On that release date, in the project's established publication timezone:

1. Add the same truthful `publishedAt: YYYY-MM-DD` (the actual first public
   Portuguese release date) to both manuscripts and change `draft: true` to
   `draft: false`.
2. Move, without renaming or rewriting content:
   - `content/drafts/pt-BR/talvez-isso-vire-alguma-coisa-um-dia.mdx` to
     `content/posts/talvez-isso-vire-alguma-coisa-um-dia.mdx`;
   - `content/drafts/pt-BR/traduzir-o-site-sem-fingir-que-tudo-ja-existe.mdx`
     to `content/posts/traduzir-o-site-sem-fingir-que-tudo-ja-existe.mdx`.
3. Run `pnpm --filter @raioviajante/dump content:routes` and commit the resulting
   `lib/published-routes.generated.ts`. It must add exactly those two post paths
   and the five localized tag paths below.
4. Update `tests/localized-routes.test.ts`: replace the pre-publication empty
   assertions with the exact published post/tag/search/sitemap inventory, and
   replace the draft-location assertion with published metadata assertions.
   Keep the simulated structural-sitemap regression test. Update any content
   identity fixture only where the new real records require it.
5. Verify the resulting public inventory:
   - posts: `/pt/posts/talvez-isso-vire-alguma-coisa-um-dia` and
     `/pt/posts/traduzir-o-site-sem-fingir-que-tudo-ja-existe`;
   - tags: `/pt/tags/pessoal`, `/pt/tags/meta`, `/pt/tags/dump`,
     `/pt/tags/arquitetura`, and `/pt/tags/web`;
   - sitemap: the two posts and five tags above, while `/pt`, `/pt/archive`,
     and `/pt/tags` remain present and indexable;
   - search: exactly two Portuguese work entries, each with its declared
     `contentId`, localized URL, title, description, date, and body;
   - metadata: self-canonicals, Portuguese Open Graph/Twitter values and valid
     social images; only the translated article forms a reciprocal English /
     Portuguese hreflang cluster.
6. Confirm `/pt/rss.xml` and Portuguese RSS autodiscovery remain absent, the
   English RSS bytes/URLs/GUIDs/order/dates remain unchanged, Portuguese posts
   do not instantiate Giscus, and English pathname-mapped Giscus remains
   unchanged.
7. Run, against the complete staged publication diff:
   - `pnpm --filter @raioviajante/dump format:check`, `lint`, `typecheck`,
     `test`, and `build`;
   - `NEXT_PUBLIC_SITE_URL=https://dump.raioviajante.com pnpm validate`;
   - with all four builds available: `pnpm seo:verify`,
     `pnpm browser:check`, `pnpm links:check`, `pnpm perf:check`, and
     `pnpm audit:check`;
   - `pnpm commits:check` after committing.
8. Require all four Vercel Preview deployments and required CI checks to pass.
   On the protected Dump Preview, verify both posts, all five tags, locale-pure
   navigation/search, reciprocal metadata for the translation, localized
   dynamic 404s, and the malformed-path cases. Do not weaken protection.
9. Obtain review of this single promotion commit before merge. Keep Dump
   `pt-BR` participation false and do not change the finalized dates after the
   first production release.

Once public, preserve each date as the localized version's first publication
date. A later edit may add `updatedAt`; it must not rewrite `publishedAt`.
