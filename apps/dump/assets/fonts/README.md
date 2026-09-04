# OG image fonts

Static, single-weight `.ttf` files for `next/og`'s `ImageResponse`, used only by
`app/opengraph-image.tsx` and `app/posts/[slug]/opengraph-image.tsx`.

`ImageResponse` (Satori) doesn't run in a browser, so it can't use the
`next/font/google` setup the rest of the site relies on — it needs raw font
bytes passed directly via its `fonts` option, and only supports `.ttf`/`.otf`/
`.woff` (not `.woff2`). These are the same families, same Google Fonts–hosted
files, just fetched once as static assets instead of self-hosted through
`next/font`.

- `SourceSerif4-Bold.ttf` — Source Serif 4, weight 700
- `IBMPlexMono-Regular.ttf` — IBM Plex Mono, weight 400

Both are licensed under the [SIL Open Font License 1.1](https://openfontlicense.org/), same as their use elsewhere in this project via `next/font/google`.

`ImageResponse` has a combined 500KB budget for JSX + fonts + images
(https://nextjs.org/docs/app/api-reference/functions/image-response), so only
the two weights the OG images actually use are vendored here — not the full
set already loaded site-wide by `next/font/google` in `app/layout.tsx`.
