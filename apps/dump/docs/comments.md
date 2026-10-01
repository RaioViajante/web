# Article comments (giscus)

Comments on `/posts/[slug]` are powered by [giscus](https://giscus.app), backed by GitHub Discussions on this repository. Implemented in `components/Comments.tsx`, mounted from `components/PostArticle.tsx`.

## Repository configuration

- **Discussions**: enabled on `RaioViajante/web`.
- **giscus GitHub App**: installed and authorized for `RaioViajante/web` (https://github.com/apps/giscus).
- **Category**: `Comments` — an open-ended discussion category.
- **Mapping**: `pathname`, strict (`data-strict="1"`) — one discussion per article URL, keyed on the URL path rather than the title/description/date, which can change without breaking the thread.

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

- Comments load lazily (`IntersectionObserver`, scoped to `Comments.tsx`) once the widget nears the viewport, so they never block article rendering.
- The widget's theme (`noborder_light` / `noborder_dark`) tracks the site's `data-theme` attribute on mount, and stays in sync live via giscus's `setConfig` postMessage when the floating theme toggle is used — no global comments state, no extra context provider.
- Reactions and metadata emission are disabled to keep the widget minimal.
