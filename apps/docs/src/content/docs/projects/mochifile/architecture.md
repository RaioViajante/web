---
contentId: projects/mochifile/architecture
locale: en
originalLocale: en
path: /projects/mochifile/architecture/
title: Mochifile architecture
description: "How Mochifile is built: the tool contract, the worker flow, the image engine, the size-targeting algorithm and the security headers."
tagline: The tool contract, the run-time flow and the image engine.
label: architecture
order: 1.21
sub: true
group: projects
status: pre-launch
meta:
  - design record
source: https://github.com/mochifile/mochifile
summary: tool contract, worker flow and image engine
---

## Scope

This page describes the public repository at commit `4efdc8c`. It covers the code that exists for the site and the one published tool. Decisions are numbered as in the repository's decision records.

## Repository layout

The repository is a pnpm and Turborepo monorepo of TypeScript packages. The table lists the main ones. Internal packages are source-only and compiled by the site's build.

| Package | Responsibility |
| --- | --- |
| `apps/web` | the Astro site: pages, registry, search metadata, security headers, end-to-end tests |
| `@mochifile/tool-kit` | the tool contract, manifest validation, worker and client wrappers, file helpers and errors |
| `@mochifile/engine-image` | image decoding, encoding, resizing and size targeting |
| `@mochifile/tool-compress-image` | the one published tool |
| `@mochifile/ui` | accessible React components and design tokens |
| `@mochifile/i18n` | locale list, localized paths and compiled messages |

The site uses Astro with React islands: pages are static HTML, and a tool page has exactly one interactive island that loads lazily.

## The tool contract

A tool is split in two so that pages stay light. The manifest is plain data: an id, a category, a runtime, accepted MIME types, limits, default options, and per-language titles, descriptions and URL slugs. The processing function takes files, options and an abort signal, returns results, and has no access to the page.

```ts
export const config: ToolRuntimeConfig<CompressImageOptions> = {
  accepts: ['image/jpeg', 'image/png', 'image/webp'],
  limits: {
    maxFiles: 20,
    maxFileSizeBytes: 50_000_000,
  },
  defaults: { targetBytes: 100_000, format: 'original' },
}
```

The runtime field is either `browser` or `server`. Browser is the default, and the contract reserves `server` for work that a browser cannot do, which requires a written decision. No published tool declares it.

## Run-time flow

1. The interface validates the chosen files for type, size and count, so feedback is immediate and nothing is sent anywhere.
2. A worker starts on first use and validates the same rules again.
3. The worker merges the options with the defaults and runs the processing function with a progress callback and an abort signal.
4. Results come back as `Blob` values, which the page turns into download links.

Cancellation aborts the signal inside the worker. Errors cross the worker boundary as a code and a message; an unexpected error becomes a generic processing failure, so internals do not reach the interface.

## The image engine

The engine encodes with WebAssembly builds of mozjpeg, libwebp and oxipng, and resizes with a gamma-correct Lanczos filter, so output is the same in every browser. Browser encoders were rejected because their size and quality differ between engines, and one major browser cannot encode WebP.

Decoding is chosen per session by small probes:

1. If reading pixels back from a canvas is not exact, as with anti-fingerprinting protections, the WebAssembly decoders are used at full size, up to 24 megapixels.
2. Otherwise, for JPEG, a reduced-size decoder is used where a probe proves it works.
3. Otherwise the browser's own bitmap decoder is used, with orientation applied.

Inputs over 100 megapixels are rejected before decoding, and processing happens at no more than 16 megapixels. Because outputs are re-encoded from pixels, they carry no EXIF, GPS or XMP data.

## Size targeting

Encoders cannot be asked for a size, only a quality and dimensions, so the compressor searches. The search is a pure function with an injected encoder, which is how it is tested with a fake codec as well as real ones.

1. If the file is already under the target in the same format, return it with metadata stripped losslessly.
2. Otherwise start from a scale chosen from the target and the pixel count.
3. Encode at quality 90, then at quality 40. If 90 fits, stop. If 40 does not fit, shrink the image and repeat.
4. Between the two, interpolate on the logarithm of the size, falling back to bisection, and stop when the interval closes, after a bounded number of encodes, or once a result uses 97% of the target.
5. A result above the target is never returned. If even the smallest allowed size fails, the tool reports that the target is unreachable.

The repository's decision record measured three to seven encodes per photo on its fixture images. That is a measurement of those photos, not a guarantee for yours.

## Hosting and security headers

The site is static output served from Cloudflare as assets only. A strict content security policy allows scripts only from the same origin, build-time hashes for the inline island scripts and WebAssembly compilation, and allows no remote styles or fonts and no framing of the site. Cross-origin isolation is not enabled globally, because it would break third-party embeds; a tool that needs it must opt in per route.

## Testing

Unit tests cover the tool kit and the engine, including codec, color profile, metadata and size-search behavior. Integration tests check the build output, such as content security hashes and the sitemap. The end-to-end suite runs Playwright in Chromium, Firefox and WebKit, with axe accessibility checks in 16 specifications, including the compressor's. Continuous integration runs lint, type checks, unit tests, the build and the end-to-end shards. These suites were read for this page and not run.

## References

- [Architecture notes](https://github.com/mochifile/mochifile/blob/4efdc8c/docs/architecture.md)
- [Decision index](https://github.com/mochifile/mochifile/blob/4efdc8c/docs/adr/README.md)
- [Size-targeting decision](https://github.com/mochifile/mochifile/blob/4efdc8c/docs/adr/0017-size-targeting-algorithm.md)
- [Client-side processing decision](https://github.com/mochifile/mochifile/blob/4efdc8c/docs/adr/0006-client-side-processing-first.md)
