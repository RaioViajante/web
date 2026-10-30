// Pure logic of the image compression lab. Everything that touches the browser
// (decoding, canvases, object URLs) is injected, so Node tests can drive the
// same session code the page uses with fakes. Nothing here uploads anything:
// there is no network code in this module.

export const LIMITS = {
  /** Largest file accepted, in bytes (decimal megabytes, like the page says). */
  maxFileBytes: 20_000_000,
  /** Largest decoded image, in pixels. */
  maxPixels: 36_000_000,
} as const;

export type OutputFormat = "jpeg" | "webp" | "png";
export const formats: readonly OutputFormat[] = ["jpeg", "webp", "png"];
export const mimeOf: Record<OutputFormat, string> = {
  jpeg: "image/jpeg",
  webp: "image/webp",
  png: "image/png",
};
/** PNG is lossless: it has no quality setting. */
export const isLossy = (format: OutputFormat): boolean => format !== "png";

/** MIME types worth trying to decode; the browser has the last word. */
export const acceptedTypes: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/bmp",
];

export type FileProblem =
  "empty" | "too-large" | "not-an-image" | "unsupported-type";

export interface FileInfo {
  name: string;
  type: string;
  size: number;
}

/** First problem with a chosen file, or `null` when it may be decoded. */
export function checkFile(file: FileInfo): FileProblem | null {
  if (!Number.isFinite(file.size) || file.size <= 0) return "empty";
  if (file.size > LIMITS.maxFileBytes) return "too-large";
  if (!file.type.startsWith("image/")) return "not-an-image";
  if (!acceptedTypes.includes(file.type)) return "unsupported-type";
  return null;
}

export interface Dimensions {
  width: number;
  height: number;
}

export const megapixels = ({ width, height }: Dimensions): number =>
  (width * height) / 1_000_000;

/** Output size for a scale in percent; never below 1 px on a side. */
export function scaled(
  { width, height }: Dimensions,
  percent: number,
): Dimensions {
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100)
    throw new RangeError(`Scale must be in (0, 100], got ${percent}`);
  return {
    width: Math.max(1, Math.round((width * percent) / 100)),
    height: Math.max(1, Math.round((height * percent) / 100)),
  };
}

/** Bytes of the decoded pixels as 8-bit RGBA: a theoretical size, not a file size. */
export const rawBytes = ({ width, height }: Dimensions): number =>
  width * height * 4;

/** Encoder quality in (0, 1] from a percent setting; `undefined` for lossless PNG. */
export function qualityOption(
  format: OutputFormat,
  percent: number,
): number | undefined {
  if (!isLossy(format)) return undefined;
  if (!Number.isInteger(percent) || percent < 1 || percent > 100)
    throw new RangeError(`Quality must be 1 to 100, got ${percent}`);
  return percent / 100;
}

export type Support = "supported" | "fallback";

/**
 * Browsers encode an unknown type as PNG instead of failing, so the type of the
 * blob that came back is the only proof the requested format was produced.
 */
export function classifyEncoded(
  requested: OutputFormat,
  blobType: string,
): Support {
  return blobType === mimeOf[requested] ? "supported" : "fallback";
}

export interface Preset {
  id: "web" | "preview" | "lossless" | "extreme" | "resize";
  format: OutputFormat;
  quality: number;
  scale: number;
}

export const presets: readonly Preset[] = [
  { id: "web", format: "jpeg", quality: 80, scale: 100 },
  { id: "preview", format: "webp", quality: 60, scale: 50 },
  { id: "lossless", format: "png", quality: 100, scale: 100 },
  { id: "extreme", format: "jpeg", quality: 10, scale: 100 },
  { id: "resize", format: "png", quality: 100, scale: 50 },
];

export const sweepQualities: readonly number[] = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
];

// ---------------------------------------------------------------- formatting

const UNITS = ["B", "kB", "MB", "GB"] as const;

/** Decimal units (1 kB = 1,000 bytes), one decimal place from kB up, in the locale's number format. */
export function formatBytes(bytes: number, intlLocale: string): string {
  if (!Number.isFinite(bytes) || bytes < 0)
    throw new RangeError(`Bytes must be a non-negative number, got ${bytes}`);
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }
  const digits = unit === 0 ? 0 : 1;
  return `${new Intl.NumberFormat(intlLocale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)} ${UNITS[unit]}`;
}

export function formatNumber(value: number, intlLocale: string): string {
  return new Intl.NumberFormat(intlLocale).format(value);
}

export function formatPercent(fraction: number, intlLocale: string): string {
  return new Intl.NumberFormat(intlLocale, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(fraction);
}

export function formatMegapixels(
  dimensions: Dimensions,
  intlLocale: string,
): string {
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(megapixels(dimensions));
}

// ------------------------------------------------------------------- measuring

export interface Measurement {
  originalBytes: number;
  outputBytes: number;
  original: Dimensions;
  output: Dimensions;
  /** Output size as a fraction of the original file size (1 means the same). */
  sizeRatio: number;
  /** Fraction of the original bytes saved; negative when the output is larger. */
  saved: number;
  /** The decoded pixels as RGBA, for the output and the original (theoretical). */
  rawOriginal: number;
  rawOutput: number;
  /** Raw pixel bytes divided by encoded bytes: how much the encoding squeezed the pixels. */
  compressionFactor: number;
}

export function measure(
  originalBytes: number,
  original: Dimensions,
  outputBytes: number,
  output: Dimensions,
): Measurement {
  if (originalBytes <= 0 || outputBytes <= 0)
    throw new RangeError("Byte sizes must be positive");
  return {
    originalBytes,
    outputBytes,
    original,
    output,
    sizeRatio: outputBytes / originalBytes,
    saved: 1 - outputBytes / originalBytes,
    rawOriginal: rawBytes(original),
    rawOutput: rawBytes(output),
    compressionFactor: rawBytes(output) / outputBytes,
  };
}

// ------------------------------------------------------------------ sample image

/**
 * A deterministic test picture as RGBA bytes: smooth color gradients (easy to
 * compress), hard-edged shapes and fine stripes (where artifacts show) and a
 * seeded noise band (hard to compress). The same size always gives the same bytes.
 */
export function samplePixels(width: number, height: number): Uint8ClampedArray {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width * height > LIMITS.maxPixels
  )
    throw new RangeError("Sample size out of range");
  const data = new Uint8ClampedArray(width * height * 4);
  let seed = 1234567;
  const noise = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed >>> 24;
  };
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const fx = x / width;
      const fy = y / height;
      let r = 40 + 180 * fx;
      let g = 60 + 150 * fy;
      let b = 200 - 120 * fx * fy;
      // A hard-edged disc and a square: sharp contours make ringing visible.
      const dx = x - width * 0.3;
      const dy = y - height * 0.45;
      if (dx * dx + dy * dy < (height * 0.22) ** 2) [r, g, b] = [245, 235, 90];
      if (
        x > width * 0.55 &&
        x < width * 0.8 &&
        y > height * 0.2 &&
        y < height * 0.55
      )
        [r, g, b] = [20, 30, 45];
      // Fine vertical stripes inside the lower left, like text or fabric.
      if (y > height * 0.7 && x < width * 0.5 && Math.floor(x / 2) % 2 === 0)
        [r, g, b] = [230, 230, 230];
      // A band of noise along the bottom: nothing to predict, so little to save.
      if (y > height * 0.88) [r, g, b] = [noise(), noise(), noise()];
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  return data;
}

// --------------------------------------------------------------------- session

export interface Decoded extends Dimensions {
  /** Frees the decoded pixels. */
  close(): void;
}

export interface Encoder {
  /** Decodes a file; rejects when the browser cannot. */
  decode(file: Blob): Promise<Decoded>;
  /** Draws `source` at `size` and encodes it. */
  encode(
    source: Decoded,
    size: Dimensions,
    format: OutputFormat,
    quality: number | undefined,
  ): Promise<Blob>;
}

export type LoadFailure =
  FileProblem | "decode-failed" | "too-many-pixels" | "stale";

export type LoadResult =
  | {
      ok: true;
      original: Dimensions;
      originalBytes: number;
    }
  | { ok: false; reason: LoadFailure };

export interface EncodeSpec {
  format: OutputFormat;
  /** Percent, 1 to 100; ignored for PNG. */
  quality: number;
  /** Percent of the original size, 1 to 100. */
  scale: number;
}

export type EncodeResult =
  | {
      ok: true;
      measurement: Measurement;
      support: Support;
      blob: Blob;
      type: string;
    }
  | { ok: false; reason: "no-image" | "stale" | "failed" };

/**
 * One loaded image and the latest encoding of it. Starting a new load or a new
 * encoding makes older, slower ones stale: their results are dropped. The page
 * draws on canvases, so no object URL is ever created (the Lab's CSP allows
 * `img-src 'self'` only, and nothing is offered for download).
 */
export class CompressionSession {
  private readonly encoder: Encoder;
  private source: Decoded | null = null;
  private file: { size: number } | null = null;
  private generation = 0;

  constructor(encoder: Encoder) {
    this.encoder = encoder;
  }

  /** The decoded picture, for drawing; `null` before a load. */
  get decoded(): Decoded | null {
    return this.source;
  }

  get hasImage(): boolean {
    return this.source !== null;
  }

  async load(file: Blob & { name: string }): Promise<LoadResult> {
    const problem = checkFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    if (problem) return { ok: false, reason: problem };
    const generation = ++this.generation;
    let decoded: Decoded;
    try {
      decoded = await this.encoder.decode(file);
    } catch {
      return { ok: false, reason: "decode-failed" };
    }
    if (generation !== this.generation) {
      decoded.close();
      return { ok: false, reason: "stale" };
    }
    if (decoded.width * decoded.height > LIMITS.maxPixels) {
      decoded.close();
      return { ok: false, reason: "too-many-pixels" };
    }
    this.clear();
    this.source = decoded;
    this.file = { size: file.size };
    return {
      ok: true,
      original: { width: decoded.width, height: decoded.height },
      originalBytes: file.size,
    };
  }

  /** Loads a decoded picture that did not come from a file (the built-in sample). */
  adopt(decoded: Decoded, blob: Blob): LoadResult {
    this.generation += 1;
    this.clear();
    this.source = decoded;
    this.file = { size: blob.size };
    return {
      ok: true,
      original: { width: decoded.width, height: decoded.height },
      originalBytes: blob.size,
    };
  }

  async encode(spec: EncodeSpec): Promise<EncodeResult> {
    const source = this.source;
    const file = this.file;
    if (!source || !file) return { ok: false, reason: "no-image" };
    const generation = ++this.generation;
    const size = scaled(source, spec.scale);
    let blob: Blob;
    try {
      blob = await this.encoder.encode(
        source,
        size,
        spec.format,
        qualityOption(spec.format, spec.quality),
      );
    } catch {
      return { ok: false, reason: "failed" };
    }
    if (generation !== this.generation || this.source !== source)
      return { ok: false, reason: "stale" };
    return {
      ok: true,
      measurement: measure(file.size, source, blob.size, size),
      support: classifyEncoded(spec.format, blob.type),
      blob,
      type: blob.type,
    };
  }

  /** Sizes of the same picture at several qualities; stops early if the session moves on. */
  async sweep(
    format: OutputFormat,
    scale: number,
  ): Promise<{ quality: number; bytes: number }[] | null> {
    const source = this.source;
    if (!source || !isLossy(format)) return null;
    const generation = this.generation;
    const size = scaled(source, scale);
    const rows: { quality: number; bytes: number }[] = [];
    for (const quality of sweepQualities) {
      let blob: Blob;
      try {
        blob = await this.encoder.encode(source, size, format, quality / 100);
      } catch {
        return null;
      }
      if (generation !== this.generation || this.source !== source) return null;
      if (classifyEncoded(format, blob.type) === "fallback") return null;
      rows.push({ quality, bytes: blob.size });
    }
    return rows;
  }

  private clear(): void {
    this.source?.close();
    this.source = null;
    this.file = null;
  }

  /** Frees the decoded image. Safe to call twice. */
  dispose(): void {
    this.generation += 1;
    this.clear();
  }
}

// ------------------------------------------------------------------ difference

/**
 * Absolute per-channel difference of two same-size RGBA pictures, amplified, as
 * opaque RGBA. Black means identical. Used by the "show difference" view.
 */
export function differencePixels(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  gain = 8,
): Uint8ClampedArray {
  if (a.length !== b.length || a.length % 4 !== 0)
    throw new RangeError("Pictures must have the same size");
  const out = new Uint8ClampedArray(a.length);
  for (let i = 0; i < a.length; i += 4) {
    out[i] = Math.abs(a[i]! - b[i]!) * gain;
    out[i + 1] = Math.abs(a[i + 1]! - b[i + 1]!) * gain;
    out[i + 2] = Math.abs(a[i + 2]! - b[i + 2]!) * gain;
    out[i + 3] = 255;
  }
  return out;
}

/** Size that fits `size` inside `limit` pixels on its long side, keeping the shape; never enlarges. */
export function fitWithin(size: Dimensions, limit: number): Dimensions {
  const long = Math.max(size.width, size.height);
  if (long <= limit) return size;
  return scaled(size, (limit / long) * 100);
}
