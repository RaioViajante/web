# Image compression lab (007)

A teaching bench for what quality, size and format do to an image file and to
the picture. It is not a compression product and does not reproduce Mochifile's
interface, branding or engine.

## Provenance

Mochifile revision `f674bf1`, read for its image-engine notes (ADR 0016: jSquash
codecs so results match across browsers, because browsers' own encoders differ
and Safari cannot encode WebP; ADR 0017: size targeting is a search over quality
and dimensions because encoders cannot be asked for a size). This lab does the
opposite on purpose: it uses the **browser's own encoders** through a canvas and
shows what they produce, so its numbers differ from Mochifile's and between
browsers. Fidelity is `runs here` for the measurements (real encodes, real
bytes); the notes state it is not Mochifile's engine.

## Privacy and resources

- The file is decoded with `createImageBitmap` in the tab and never sent
  anywhere. `src/lib/image-compression.ts` contains no network code (a test
  checks for it), and the e2e probe saw no request beyond the page's own origin.
- Limits: 20 MB (decimal) per file, 36 megapixels decoded, previews drawn at
  most 2,000 px on the long side. Rejections are named: empty, too large, not an
  image, unsupported type, cannot be decoded, too many pixels.
- No object URL is created. The Lab's CSP allows `img-src 'self'` only, so
  previews are drawn on canvases instead of `blob:` images, and nothing is
  offered for download. A test asserts the module and the page create none.
- Bitmaps are closed when another image replaces them and on `pagehide`; encode
  canvases are shrunk to 0 × 0 after use; the only timer is a 150 ms debounce,
  cleared on `pagehide`.

## Model

`CompressionSession` takes an `Encoder` (decode, encode) so the page and the Node
tests drive the same code. A newer load or encode makes older, slower ones stale
and drops their results. Output bytes are `blob.size`, never an estimate. A
format the browser cannot encode comes back as PNG; `classifyEncoded` compares
the returned type with the requested one and the page says so. JPEG output is
drawn on white because JPEG has no alpha. Resizing uses the canvas' high-quality
smoothing at a percentage of the original width and height.

Labeled **measured**: file sizes and the saved fraction. Labeled **theoretical**:
the uncompressed RGBA size of the pixels and the pixels-per-byte factor. The
quality sweep is ten real encodes at 10..100 for the current format and size,
abandoned if the image or settings change. The difference view compares both
pictures at one preview size, amplified 8 times.

## Tests

`tests/image-compression.test.mjs` (file acceptance and invalid inputs,
dimensions, quality rules, support detection, measurement accuracy, session
staleness and cleanup with fake encoders, sweep, difference pixels, sample
picture determinism, no network code, no object URLs) and
`tests/image-compression-copy.test.mjs` (EN/PT parity, plurals, number formats).
