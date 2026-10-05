import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** The OG renderer needs local font bytes and literal colors. These match the
 * shared editorial tokens consumed by the site shell. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const OG_IMAGE_CONTENT_TYPE = "image/png";
export const OG_BG = "#191919";
export const OG_FG = "#edf1f6";
export const OG_MUTED = "#8792a1";
export const OG_FONT = "Noto Sans Mono";

const FONT_DIR = join(process.cwd(), "assets", "fonts");

type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
};
let fontsPromise: Promise<OgFont[]> | null = null;

export function loadOgFonts(): Promise<OgFont[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      readFile(join(FONT_DIR, "NotoSansMono-400.ttf")),
      readFile(join(FONT_DIR, "NotoSansMono-700.ttf")),
    ]).then(([regular, bold]) => [
      { name: OG_FONT, data: regular, weight: 400, style: "normal" },
      { name: OG_FONT, data: bold, weight: 700, style: "normal" },
    ]);
  }
  return fontsPromise;
}

export function titleFontSize(title: string): number {
  const length = title.length;
  if (length <= 40) return 70;
  if (length <= 70) return 58;
  if (length <= 100) return 46;
  return 38;
}

export function ogDate(date: string): string {
  return date.replaceAll("-", ".");
}
