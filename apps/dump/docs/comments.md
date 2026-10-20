# Article comments (giscus)

Comments on every article, English and Portuguese, are powered by [giscus](https://giscus.app), backed by GitHub Discussions on this repository. Implemented in `components/Comments.tsx`, mounted from `components/PostArticle.tsx`.

## Repository configuration

- **Discussions**: enabled on `RaioViajante/web`.
- **giscus GitHub App**: installed and authorized for `RaioViajante/web` (https://github.com/apps/giscus).
- **Category**: `Comments` — an open-ended discussion category.
- **Mapping**: `specific`, strict (`data-strict="1"`), `data-term` = `commentKey` = `posts/<contentId>` (`lib/comment-key.ts`) — one discussion per work, shared by every localized version, independent of slug, title, locale and date. This replaced `pathname` mapping (`posts/<slug>` without the leading slash); for every existing post the two terms are identical, so existing discussions keep matching.
- **Interface language** (`data-lang`): `en` for English articles, `pt` for Portuguese ones. giscus ships one Portuguese interface, `pt`, and no `pt-BR` (its `i18n.js` locale list). Only the interface changes; the discussion is the same.

### Identifiers

Retrieved from GitHub's GraphQL API, not invented:

| Field         | Value                  |
| ------------- | ---------------------- |
| Repository ID | `R_kgDOUu8oYA`         |
| Category name | `Comments`             |
| Category ID   | `DIC_kwDOUu8oYM4DGx0J` |

To re-derive these (e.g. after recreating the repo or category), query:

```graphql
query {
  repository(owner: "RaioViajante", name: "web") {
    id
    discussionCategories(first: 20) {
      nodes {
        id
        name
        slug
      }
    }
  }
}
```

## Moderation

RaioViajante moderates the `Comments` discussion category (same as repository maintenance generally). Discussions should **stay enabled long-term** — they are the storage backend for every published article's comments, not a one-off feature.

## Notes

- Comments load lazily (`IntersectionObserver`, `rootMargin: 200px`, scoped to `Comments.tsx`) once the section nears the viewport. Until then the page shows a local status line and makes no request to giscus.app or GitHub; the script is added at most once. Without `IntersectionObserver` the reader gets a "Load comments" button instead of an automatic load. A failed script load shows a message and a "Try again" button. A short article whose comments section starts within 200px of the first screen loads them immediately. The exception is returning from GitHub sign-in: giscus puts its session in `?giscus=` on the article URL and only its own script reads and removes it, so when that parameter is present the script loads immediately (once) instead of waiting for a scroll. The component does not read, copy or store the token.
- The widget uses a custom theme at `/giscus.css` (`app/giscus.css/route.ts`), generated at build time from the shared design tokens and served with a CORS header for the giscus iframe.
- Reactions and metadata emission are disabled to keep the widget minimal.

## Stable identity migration (issue #49)

- **Snapshot**: `tests/fixtures/giscus-discussions-snapshot.json`, taken 2026-10-20 with a read-only GraphQL query: the repository had one discussion, #14 (`D_kwDOUu8oYM4AprNS`, `Comments` category), title `posts/maybe-this-can-be-something-someday`, strict marker `65f3e21f…fdfd48` (the SHA-1 of that exact term; the SHA-1 of the term with a leading slash differs), one comment (`DC_kwDOUu8oYM4BHTFa`). Comment bodies are not stored.
- **Offline proof**: `tests/comment-identity.test.ts` checks the key against the legacy term, the marker against the key's SHA-1, and that missing or inconsistent evidence fails.
- **Live read-only proof**: `node scripts/verify-giscus-identity.mjs` issues one GraphQL _query_ and mirrors giscus's strict resolution (category plus marker, never the title). It fails if a key resolves zero or several discussions, a different one, or a lost comment. Run it before and after any switch.
- A work with no discussion needs no entry: giscus creates one only when someone posts the first comment, never on view.
- Rollout order: snapshot, stable key, preview exact-identity proof in a browser, independent review, controlled merge, production verification.
