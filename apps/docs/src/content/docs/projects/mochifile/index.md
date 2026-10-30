---
contentId: projects/mochifile
locale: en
originalLocale: en
path: /projects/mochifile/
title: Mochifile
description: Friendly file tools that run in your browser, so your files stay on your device. What exists today, what stays local, and what is only planned.
tagline: Simple, private file tools that run in your browser.
order: 1.2
group: projects
status: pre-launch
meta:
  - web tools
  - agpl-3.0
source: https://github.com/mochifile/mochifile
summary: private file tools that run in your browser
---

## Overview

Mochifile is a set of file tools for people who are not technical and just need a job done: a form says the photo must be under 50 KB, so you add your file, choose a size and download the result. The processing happens in your browser, so the file is not uploaded.

That plainness is a design goal, not an accident. Each tool is a page with one purpose, a plain-language title, and the same wording in English and Portuguese. The engineering underneath is what keeps that promise: files are processed on the device, in a background worker, and the project's rule is that no network request follows the choice of a file.

:::important
Today Mochifile has one tool, Compress an image, and it is pre-launch: the site is live but serves a `noindex` header so search engines skip it. Other tools mentioned in the project's documents are not available.
:::

## Current state

Verified against the public repository at commit `4efdc8c`.

| Capability | State | Notes |
| --- | --- | --- |
| Compress an image to a target size | implemented | JPEG, PNG and WebP in; up to 20 files of 50 MB each; six preset-size pages |
| Image conversion engine (HEIC, AVIF, JPG, PNG, WebP) | engine only | the code and tests exist, but no tool page uses it yet |
| Other tools (PDF, passport photo, video) | planned | named as examples in the architecture notes; no code exists |
| English and Portuguese pages | implemented | every page has its own URL in each language |
| Accounts, billing and a developer API | not available | the sign-in and API pages say so; no server answers them |
| Server-side processing | not used | no tool in the public repository sends a file to a server |
| Command line and AI-assistant integrations | not available | the related repositories contain no commits |

The six preset pages for the compressor target 20 KB, 50 KB, 100 KB, 200 KB, 500 KB and 1 MB. Sizes use decimal units, so a 50 KB result is at most 50,000 bytes and also passes portals that count 1,024 bytes per KB.

## What stays on your device

For browser tools, the file is read, decoded, resized, encoded and handed back as a download without leaving the page. The architecture records these rules:

- Processing runs in a Web Worker, never on the interface thread.
- Codecs are WebAssembly files served from Mochifile's own origin, and they load when you first show intent to use a tool, not after you pick a file.
- Results are re-encoded from pixels, so photo metadata such as EXIF, GPS and XMP is not carried over. A file that is already small enough has its metadata removed without re-encoding.
- File contents and names are not logged, and errors are reduced to codes.
- Analytics, when added, must be cookieless and aggregate.

A separate private repository is reserved for accounts, payments and any processing that a browser cannot do. The architecture says such a server path would need its own written decision, ask for explicit consent and delete files immediately after the job. Nothing in the public tools uses it, and this page does not describe the private repository.

## How a tool works, briefly

Every tool is a package with a data manifest, a pure processing function and a small interface. The site reads only manifests to build pages, and loads a tool's interface and worker only when it is needed. The [architecture page](/projects/mochifile/architecture/) walks through the contract, the run-time flow, the image engine and the size-targeting algorithm.

## Browsers and accessibility

The end-to-end suite runs in Chromium, Firefox and WebKit, and 16 of its specifications run automated accessibility checks with axe, including the compressor's. Image decoding adapts to the browser: native decoders are used where a probe shows they work, and WebAssembly decoders step in otherwise, which is how HEIC photos can be read outside Safari. Memory is bounded by rejecting inputs over 100 megapixels and processing at no more than 16 megapixels.

Mochifile does not publish a list of supported browser versions, so none is claimed here.

## Limitations

- Speed depends on your device. A large photo can take a few seconds on a phone.
- A target can be unreachable: when quality 40 at the smallest allowed size still exceeds the target, the tool reports that instead of returning an oversize file.
- Transparent images become JPEG with a white background when the output must be JPEG, and the result says so.
- The project accepted a patent risk around the HEVC decoder used for HEIC, and set a condition to take legal advice before any monetization. That decoder is not exposed by any current tool.

## References

- [Mochifile website](https://mochifile.com/compress-image/)
- [Public repository](https://github.com/mochifile/mochifile) and its [architecture notes](https://github.com/mochifile/mochifile/blob/4efdc8c/docs/architecture.md)
- [Architecture decision records](https://github.com/mochifile/mochifile/tree/4efdc8c/docs/adr)
