import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared setup for the generated Open Graph images
 * (`app/opengraph-image.tsx`, `app/posts/[slug]/opengraph-image.tsx`).
 *
 * `ImageResponse` renders via Satori, not a browser, so it can't use the
 * `next/font/google` setup the rest of the site relies on (see
 * `assets/fonts/README.md`) and only understands a small, explicit CSS
 * subset — no `color-mix()`, no CSS custom properties. The constants below
 * are the `dump` light-theme values from `app/globals.css`, flattened to
 * literal colors.
 */

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const OG_IMAGE_CONTENT_TYPE = "image/png";

// [data-theme="light"] tokens, app/globals.css.
export const OG_PAPER = "#f4f2ef";
export const OG_INK = "#201e1d";
export const OG_ACCENT = "#4a3d68";
// --color-muted (light): color-mix(in srgb, var(--fg) 65%, transparent).
// ImageResponse has no color-mix(), but an alpha color composited over the
// solid paper background below produces the identical result.
export const OG_MUTED = "rgba(32, 30, 29, 0.65)";

export const OG_FONT_SERIF = "Source Serif 4";
export const OG_FONT_MONO = "IBM Plex Mono";

const FONT_DIR = join(process.cwd(), "assets", "fonts");

interface OgFont {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
}

// Fonts don't depend on request data, so read them once per server instance
// and reuse the same promise for every image request after that:
// https://nextjs.org/docs/app/getting-started/caching#predictable-values
let fontsPromise: Promise<OgFont[]> | null = null;

export function loadOgFonts(): Promise<OgFont[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      readFile(join(FONT_DIR, "SourceSerif4-Bold.ttf")),
      readFile(join(FONT_DIR, "IBMPlexMono-Regular.ttf")),
    ]).then(([serifBold, mono]) => [
      { name: OG_FONT_SERIF, data: serifBold, weight: 700, style: "normal" },
      { name: OG_FONT_MONO, data: mono, weight: 400, style: "normal" },
    ]);
  }
  return fontsPromise;
}

/**
 * Title font size, tiered by length so a long title wraps onto more lines
 * within the fixed canvas instead of shrinking past legibility.
 */
export function titleFontSize(title: string): number {
  const length = title.length;
  if (length <= 40) return 72;
  if (length <= 70) return 60;
  if (length <= 100) return 48;
  return 40;
}

/** "2026-09-04" -> "2026.09.04". Post dates are already validated
 * `YYYY-MM-DD` strings, so this is plain text formatting — no Date parsing,
 * no timezone to get wrong. */
export function ogDate(date: string): string {
  return date.replaceAll("-", ".");
}
