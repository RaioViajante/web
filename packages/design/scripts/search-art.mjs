/**
 * Derives the search page illustration from its full-size source:
 *
 *   pnpm --filter @raioviajante/design search-art
 *
 * The page shows it at 150 CSS pixels (100 on phones), so 320 pixels cover a
 * 2x desktop and 3x phone screen at about a third of the bytes. The source in
 * `assets/search/source/` stays the canonical artwork; the derivative is never
 * edited by hand and a test checks it is the right size and still derived.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const size = 320;
const dir = fileURLToPath(new URL("../assets/search/", import.meta.url));
export const source = `${dir}source/search-character.png`;
export const target = `${dir}search-character.png`;

/** Palette PNG like the source and the site icons: no visible loss on flat art. */
export const PNG = {
  palette: true,
  quality: 95,
  compressionLevel: 9,
  effort: 10,
};

export const derive = () =>
  sharp(source).resize(size, size, { kernel: "lanczos3" }).png(PNG).toBuffer();

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await writeFile(target, await derive());
}
