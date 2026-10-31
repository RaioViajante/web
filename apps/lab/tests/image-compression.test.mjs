import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  CompressionSession,
  LIMITS,
  acceptedTypes,
  checkFile,
  differencePixels,
  fitWithin,
  classifyEncoded,
  formatBytes,
  formatMegapixels,
  formatNumber,
  formatPercent,
  formats,
  isLossy,
  measure,
  megapixels,
  presets,
  readDimensions,
  qualityOption,
  rawBytes,
  samplePixels,
  scaled,
  sweepQualities,
} from "../src/lib/image-compression.ts";

// ------------------------------------------------------------------ fakes

function fakeEncoder({
  width = 400,
  height = 300,
  encodedBytes = (q, size) =>
    Math.round(size.width * size.height * (q ?? 1) * 0.2),
  failDecode = false,
  typeFor = (f) => `image/${f}`,
} = {}) {
  const closed = [];
  const calls = [];
  const pending = [];
  return {
    closed,
    calls,
    pending,
    probe: async () => ({ width, height }),
    decode: async () => {
      if (failDecode) throw new Error("cannot decode");
      return { width, height, close: () => closed.push(1) };
    },
    encode: (source, size, format, quality) => {
      calls.push({ size, format, quality });
      const blob = { size: encodedBytes(quality, size), type: typeFor(format) };
      return new Promise((resolve) => pending.push(() => resolve(blob))).then(
        (value) => value,
      );
    },
    flush: () => pending.splice(0).forEach((resolve) => resolve()),
  };
}
// An encoder that answers at once.
function instant(options) {
  const encoder = fakeEncoder(options);
  const encode = encoder.encode;
  encoder.encode = (...args) => {
    const promise = encode(...args);
    queueMicrotask(() => encoder.flush());
    return promise;
  };
  return encoder;
}
const file = (over = {}) => ({
  name: "photo.jpg",
  type: "image/jpeg",
  size: 120_000,
  ...over,
});

// --------------------------------------------------------------- file checks

test("file acceptance and invalid inputs", () => {
  assert.equal(checkFile(file()), null);
  for (const type of acceptedTypes)
    assert.equal(checkFile(file({ type })), null, type);
  assert.equal(checkFile(file({ size: 0 })), "empty");
  assert.equal(checkFile(file({ size: NaN })), "empty");
  assert.equal(checkFile(file({ size: -5 })), "empty");
  assert.equal(checkFile(file({ size: LIMITS.maxFileBytes + 1 })), "too-large");
  assert.equal(checkFile(file({ size: LIMITS.maxFileBytes })), null);
  assert.equal(checkFile(file({ type: "application/pdf" })), "not-an-image");
  assert.equal(checkFile(file({ type: "" })), "not-an-image");
  assert.equal(checkFile(file({ type: "image/svg+xml" })), "unsupported-type");
  assert.equal(checkFile(file({ type: "image/tiff" })), "unsupported-type");
});

// ---------------------------------------------------------------- dimensions

test("output dimensions follow the scale and never reach zero", () => {
  assert.deepEqual(scaled({ width: 4000, height: 3000 }, 50), {
    width: 2000,
    height: 1500,
  });
  assert.deepEqual(scaled({ width: 4000, height: 3000 }, 100), {
    width: 4000,
    height: 3000,
  });
  assert.deepEqual(scaled({ width: 333, height: 111 }, 25), {
    width: 83,
    height: 28,
  });
  assert.deepEqual(scaled({ width: 3, height: 2 }, 10), {
    width: 1,
    height: 1,
  });
  for (const bad of [0, -1, 101, NaN, Infinity])
    assert.throws(
      () => scaled({ width: 10, height: 10 }, bad),
      RangeError,
      String(bad),
    );
  assert.equal(megapixels({ width: 4000, height: 3000 }), 12);
  assert.equal(rawBytes({ width: 100, height: 50 }), 20_000);
});

test("quality applies to lossy formats only", () => {
  assert.deepEqual(formats.filter(isLossy), ["jpeg", "webp"]);
  assert.equal(qualityOption("jpeg", 80), 0.8);
  assert.equal(qualityOption("webp", 1), 0.01);
  assert.equal(qualityOption("png", 80), undefined);
  assert.equal(
    qualityOption("png", 0),
    undefined,
    "PNG ignores the setting entirely",
  );
  for (const bad of [0, 101, 5.5, NaN])
    assert.throws(() => qualityOption("jpeg", bad), RangeError, String(bad));
});

test("a browser that cannot encode a format answers with PNG, which is detected", () => {
  assert.equal(classifyEncoded("jpeg", "image/jpeg"), "supported");
  assert.equal(classifyEncoded("webp", "image/webp"), "supported");
  assert.equal(classifyEncoded("webp", "image/png"), "fallback");
  assert.equal(classifyEncoded("png", "image/png"), "supported");
  assert.equal(classifyEncoded("jpeg", ""), "fallback");
});

test("presets are valid settings", () => {
  assert.ok(presets.length >= 4);
  for (const preset of presets) {
    assert.ok(formats.includes(preset.format));
    assert.doesNotThrow(() => qualityOption(preset.format, preset.quality));
    assert.doesNotThrow(() =>
      scaled({ width: 100, height: 100 }, preset.scale),
    );
  }
  assert.equal(new Set(presets.map((p) => p.id)).size, presets.length);
});

// ------------------------------------------------------------------ formatting

test("byte, number and percent formatting follow the locale with decimal units", () => {
  assert.equal(formatBytes(0, "en-US"), "0 B");
  assert.equal(formatBytes(999, "en-US"), "999 B");
  assert.equal(formatBytes(1000, "en-US"), "1.0 kB");
  assert.equal(formatBytes(1_234_567, "en-US"), "1.2 MB");
  assert.equal(formatBytes(1_234_567, "pt-BR"), "1,2 MB");
  assert.equal(formatBytes(1500, "pt-BR"), "1,5 kB");
  assert.equal(formatBytes(2_500_000_000, "en-US"), "2.5 GB");
  assert.equal(formatNumber(1234567, "en-US"), "1,234,567");
  assert.equal(formatNumber(1234567, "pt-BR"), "1.234.567");
  assert.equal(formatPercent(0.37, "pt-BR"), "37%");
  assert.equal(
    formatMegapixels({ width: 4000, height: 3000 }, "pt-BR"),
    "12,0",
  );
  for (const bad of [-1, NaN, Infinity])
    assert.throws(() => formatBytes(bad, "en-US"), RangeError);
});

test("measurements are computed from the real byte counts", () => {
  const m = measure(200_000, { width: 1000, height: 800 }, 50_000, {
    width: 500,
    height: 400,
  });
  assert.equal(m.sizeRatio, 0.25);
  assert.equal(m.saved, 0.75);
  assert.equal(m.rawOriginal, 3_200_000);
  assert.equal(m.rawOutput, 800_000);
  assert.equal(m.compressionFactor, 16);
  assert.ok(
    measure(1000, { width: 1, height: 1 }, 2000, { width: 1, height: 1 })
      .saved < 0,
    "a larger output saves nothing",
  );
  assert.throws(
    () => measure(0, { width: 1, height: 1 }, 1, { width: 1, height: 1 }),
    RangeError,
  );
  assert.throws(
    () => measure(1, { width: 1, height: 1 }, 0, { width: 1, height: 1 }),
    RangeError,
  );
});

// ---------------------------------------------------------------- sample image

test("the sample picture is deterministic, opaque and has the requested size", () => {
  const a = samplePixels(64, 48);
  const b = samplePixels(64, 48);
  assert.equal(a.length, 64 * 48 * 4);
  assert.deepEqual(a, b);
  for (let i = 3; i < a.length; i += 4) assert.equal(a[i], 255);
  assert.notDeepEqual(
    samplePixels(64, 48),
    samplePixels(65, 48).slice(0, a.length),
  );
  assert.throws(() => samplePixels(0, 10), RangeError);
  assert.throws(() => samplePixels(10.5, 10), RangeError);
  assert.throws(() => samplePixels(10_000, 10_000), RangeError);
});

// ------------------------------------------------------------------ object URLs

// ---------------------------------------------------------------------- session

test("loading reports dimensions and the original byte size, and rejects bad files before decoding", async () => {
  const encoder = instant({ width: 800, height: 600 });
  const session = new CompressionSession(encoder);
  const loaded = await session.load({ ...file({ size: 90_000 }) });
  assert.deepEqual(loaded, {
    ok: true,
    original: { width: 800, height: 600 },
    originalBytes: 90_000,
  });
  assert.equal((await session.load(file({ size: 0 }))).reason, "empty");
  assert.equal(
    (await session.load(file({ type: "text/plain" }))).reason,
    "not-an-image",
  );
  assert.equal(
    encoder.closed.length,
    0,
    "a rejected file never reaches the decoder and closes nothing",
  );
  assert.equal(
    session.hasImage,
    true,
    "a rejected file leaves the current image alone",
  );
});

test("an image that cannot be decoded or has too many pixels is refused and freed", async () => {
  const broken = new CompressionSession(fakeEncoder({ failDecode: true }));
  assert.equal((await broken.load(file())).reason, "decode-failed");
  assert.equal(broken.hasImage, false);

  const huge = instant({ width: 7000, height: 6000 });
  const session = new CompressionSession(huge);
  assert.equal((await session.load(file())).reason, "too-many-pixels");
  assert.equal(
    huge.closed.length,
    0,
    "an oversized image is refused from its header and never decoded",
  );
  assert.equal(session.hasImage, false);
  const edge = instant({ width: 6000, height: 6000 });
  assert.equal((await new CompressionSession(edge).load(file())).ok, true);
});

test("encoding measures the real blob and the real output dimensions", async () => {
  const encoder = instant({
    width: 1000,
    height: 800,
    encodedBytes: () => 33_333,
  });
  const session = new CompressionSession(encoder);
  await session.load(file({ size: 200_000 }));
  const result = await session.encode({
    format: "jpeg",
    quality: 70,
    scale: 50,
  });
  assert.equal(result.ok, true);
  assert.equal(
    result.measurement.outputBytes,
    33_333,
    "bytes come from the blob, never an estimate",
  );
  assert.deepEqual(result.measurement.output, { width: 500, height: 400 });
  assert.equal(result.support, "supported");
  assert.deepEqual(encoder.calls.at(-1), {
    size: { width: 500, height: 400 },
    format: "jpeg",
    quality: 0.7,
  });
  const png = await session.encode({ format: "png", quality: 5, scale: 100 });
  assert.equal(
    encoder.calls.at(-1).quality,
    undefined,
    "PNG is encoded without a quality",
  );
  assert.equal(png.measurement.output.width, 1000);
});

test("a format the browser cannot encode is reported as a fallback", async () => {
  const encoder = instant({ typeFor: () => "image/png" });
  const session = new CompressionSession(encoder);
  await session.load(file());
  const result = await session.encode({
    format: "webp",
    quality: 80,
    scale: 100,
  });
  assert.equal(result.support, "fallback");
  assert.equal(result.type, "image/png");
  assert.equal(
    await session.sweep("webp", 100),
    null,
    "a sweep of an unsupported format is not shown",
  );
});

test("encoding without an image, and encoder failures, are reported", async () => {
  const empty = new CompressionSession(instant());
  assert.deepEqual(
    await empty.encode({ format: "jpeg", quality: 80, scale: 100 }),
    { ok: false, reason: "no-image" },
  );
  const failing = instant();
  const session = new CompressionSession(failing);
  await session.load(file());
  failing.encode = () => Promise.reject(new Error("canvas failed"));
  assert.deepEqual(
    await session.encode({ format: "jpeg", quality: 80, scale: 100 }),
    { ok: false, reason: "failed" },
  );
});

test("an older, slower encoding never replaces a newer one", async () => {
  const encoder = fakeEncoder({
    encodedBytes: (q) => Math.round((q ?? 1) * 100_000),
  });
  const session = new CompressionSession(encoder);
  const load = session.load(file());
  await Promise.resolve();
  await load;
  const slow = session.encode({ format: "jpeg", quality: 90, scale: 100 });
  const fast = session.encode({ format: "jpeg", quality: 20, scale: 100 });
  // Resolve the newer one first, then the older.
  const [olderResolve, newerResolve] = encoder.pending;
  newerResolve();
  const newer = await fast;
  olderResolve();
  const older = await slow;
  assert.equal(newer.ok, true);
  assert.equal(newer.measurement.outputBytes, 20_000);
  assert.deepEqual(older, { ok: false, reason: "stale" });
});

test("replacing the image closes the old bitmap and disposing frees the current one", async () => {
  const encoder = instant();
  const session = new CompressionSession(encoder);
  await session.load(file());
  await session.encode({ format: "jpeg", quality: 80, scale: 100 });
  assert.ok(session.decoded);
  await session.load(file({ name: "second.png", type: "image/png" }));
  assert.equal(encoder.closed.length, 1);
  await session.encode({ format: "webp", quality: 50, scale: 50 });
  await session.encode({ format: "webp", quality: 60, scale: 50 });
  session.dispose();
  assert.equal(session.decoded, null);
  assert.equal(encoder.closed.length, 2);
  session.dispose();
  assert.equal(encoder.closed.length, 2, "disposing twice is harmless");
  assert.deepEqual(
    await session.encode({ format: "jpeg", quality: 80, scale: 100 }),
    { ok: false, reason: "no-image" },
  );
});

test("no object URL is ever created: previews are drawn on canvases", () => {
  const code = readFileSync(
    new URL("../src/lib/image-compression.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(code, /createObjectURL|revokeObjectURL/);
  for (const file of [
    "../src/components/surfaces/ImageCompressionLab.astro",
    "../src/lib/image-compression-browser.ts",
  ])
    assert.doesNotMatch(
      readFileSync(new URL(file, import.meta.url), "utf8"),
      /createObjectURL|URL\.create/,
      file,
    );
});

test("a failed new load keeps the previous image usable", async () => {
  const encoder = instant();
  const session = new CompressionSession(encoder);
  await session.load(file());
  encoder.decode = async () => {
    throw new Error("nope");
  };
  assert.equal((await session.load(file())).reason, "decode-failed");
  assert.equal(
    (await session.encode({ format: "jpeg", quality: 80, scale: 100 })).ok,
    true,
  );
});

test("the quality sweep measures every step and stops when the image changes", async () => {
  const encoder = instant({
    encodedBytes: (q) => Math.round((q ?? 1) * 50_000),
  });
  const session = new CompressionSession(encoder);
  await session.load(file());
  const rows = await session.sweep("jpeg", 100);
  assert.deepEqual(
    rows.map((r) => r.quality),
    [...sweepQualities],
  );
  assert.deepEqual(
    rows.map((r) => r.bytes),
    sweepQualities.map((q) => q * 500),
  );
  assert.equal(
    await session.sweep("png", 100),
    null,
    "lossless output has no quality to sweep",
  );
  // A new load in the middle of a sweep abandons it.
  const running = session.sweep("jpeg", 100);
  await session.load(file());
  assert.equal(await running, null);
});

test("the module contains no network code", () => {
  const code = readFileSync(
    new URL("../src/lib/image-compression.ts", import.meta.url),
    "utf8",
  )
    .split("\n")
    .filter(
      (line) =>
        !line.trim().startsWith("//") &&
        !line.trim().startsWith("*") &&
        !line.trim().startsWith("/*"),
    )
    .join("\n");
  assert.doesNotMatch(
    code,
    /\bfetch\b|XMLHttpRequest|sendBeacon|WebSocket|EventSource|navigator\./,
  );
});

test("the difference view is black for identical pictures and amplifies changes", () => {
  const a = samplePixels(8, 8);
  assert.ok(
    differencePixels(a, a).every((v, i) => (i % 4 === 3 ? v === 255 : v === 0)),
  );
  const b = a.slice();
  b[0] = Math.min(255, a[0] + 10);
  b[1] = Math.max(0, a[1] - 40);
  const d = differencePixels(a, b);
  assert.equal(
    d[0],
    Math.abs(b[0] - a[0]) * 8 > 255 ? 255 : Math.abs(b[0] - a[0]) * 8,
  );
  assert.equal(d[1], 255, "large differences clamp at white");
  assert.equal(d[4], 0);
  assert.throws(
    () => differencePixels(new Uint8ClampedArray(8), new Uint8ClampedArray(4)),
    RangeError,
  );
});

test("previews fit inside a limit without enlarging", () => {
  assert.deepEqual(fitWithin({ width: 4000, height: 3000 }, 1000), {
    width: 1000,
    height: 750,
  });
  assert.deepEqual(fitWithin({ width: 600, height: 400 }, 1000), {
    width: 600,
    height: 400,
  });
  assert.deepEqual(fitWithin({ width: 3000, height: 4000 }, 1000), {
    width: 750,
    height: 1000,
  });
});

// A minimal file header for each supported format.
const bytes = (...parts) => Uint8Array.from(parts.flat());
const be32 = (n) => [
  (n >>> 24) & 255,
  (n >>> 16) & 255,
  (n >>> 8) & 255,
  n & 255,
];
const le16 = (n) => [n & 255, (n >> 8) & 255];
const le32 = (n) => [
  n & 255,
  (n >>> 8) & 255,
  (n >>> 16) & 255,
  (n >>> 24) & 255,
];
const text = (s) => [...s].map((c) => c.charCodeAt(0));

test("dimensions are read from the file header, without decoding", () => {
  const png = bytes(
    [0x89],
    text("PNG\r\n"),
    [0x1a, 0x0a],
    be32(13),
    text("IHDR"),
    be32(30000),
    be32(20000),
    new Array(8).fill(0),
  );
  assert.deepEqual(readDimensions(png), { width: 30000, height: 20000 });
  assert.deepEqual(
    readDimensions(bytes(text("GIF89a"), le16(640), le16(480), [0, 0, 0])),
    { width: 640, height: 480 },
  );
  const bmp = bytes(
    text("BM"),
    new Array(12).fill(0),
    le32(40),
    le32(800),
    le32(-600),
    new Array(8).fill(0),
  );
  assert.deepEqual(readDimensions(bmp), { width: 800, height: 600 });
  // JPEG: skip an APP0 segment, then read the SOF0 frame header (height first, then width).
  const jpeg = bytes(
    [0xff, 0xd8],
    [0xff, 0xe0, 0, 6, 1, 2, 3, 4],
    [0xff, 0xc0, 0, 11, 8],
    [0x0b, 0xb8],
    [0x0f, 0xa0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0],
  );
  assert.deepEqual(readDimensions(jpeg), { width: 4000, height: 3000 });
  const vp8x = bytes(
    text("RIFF"),
    le32(30),
    text("WEBPVP8X"),
    le32(10),
    [0, 0, 0, 0],
    [0x0f, 0x27, 0],
    [0xc7, 0x1d, 0],
    new Array(4).fill(0),
  );
  assert.deepEqual(readDimensions(vp8x), { width: 10000, height: 7624 });
  const vp8 = bytes(
    text("RIFF"),
    le32(30),
    text("WEBPVP8 "),
    le32(10),
    [0, 0, 0],
    [0x9d, 0x01, 0x2a],
    le16(1024),
    le16(768),
    new Array(4).fill(0),
  );
  assert.deepEqual(readDimensions(vp8), { width: 1024, height: 768 });
});

test("headers that cannot be read give no size", () => {
  assert.equal(readDimensions(new Uint8Array(0)), null);
  assert.equal(
    readDimensions(bytes(text("not an image at all, just text........."))),
    null,
  );
  assert.equal(
    readDimensions(bytes([0xff, 0xd8], [0xff, 0xe0, 0, 4, 0, 0])),
    null,
    "a JPEG with no frame header",
  );
  assert.equal(
    readDimensions(bytes([0x89], text("PNG"), new Array(10).fill(0))),
    null,
    "a truncated PNG",
  );
  assert.equal(
    readDimensions(bytes(text("<svg xmlns='http://www.w3.org/2000/svg'/>"))),
    null,
  );
});

test("a file that declares a huge size is refused before anything is decoded", async () => {
  const encoder = instant({ width: 30000, height: 20000 });
  let decodes = 0;
  const decode = encoder.decode;
  encoder.decode = async (f) => {
    decodes += 1;
    return decode(f);
  };
  const session = new CompressionSession(encoder);
  assert.equal(
    (await session.load(file({ size: 4000 }))).reason,
    "too-many-pixels",
  );
  assert.equal(decodes, 0, "the decoder never saw it");
  encoder.probe = async () => null;
  assert.equal(
    (await session.load(file())).reason,
    "decode-failed",
    "an unreadable header is refused too",
  );
  assert.equal(decodes, 0);
});

test("moving a slider while a file is still loading does not discard the file", async () => {
  const encoder = instant({ width: 100, height: 80 });
  const session = new CompressionSession(encoder);
  await session.load(file());
  let release;
  const slow = new Promise((resolve) => (release = resolve));
  const decode = encoder.decode;
  encoder.decode = async (f) => {
    await slow;
    return decode(f);
  };
  const loading = session.load(file({ name: "big.jpg" }));
  await session.encode({ format: "jpeg", quality: 50, scale: 100 });
  release();
  assert.equal(
    (await loading).ok,
    true,
    "an encode in between does not stale a load",
  );
  // A second load, in contrast, does take over.
  encoder.decode = async (f) => {
    await new Promise((r) => setTimeout(r, 5));
    return decode(f);
  };
  const first = session.load(file({ name: "a.jpg" }));
  const second = session.load(file({ name: "b.jpg" }));
  assert.equal((await first).reason, "stale");
  assert.equal((await second).ok, true);
});
