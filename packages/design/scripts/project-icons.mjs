/**
 * Derives the project icons and the Mochifile wordmark from their supplied
 * sources:
 *
 *   pnpm --filter @raioviajante/design project-icons
 *
 * Root's projects pages show the icons at 26 to 42 CSS pixels, the Refrain
 * sticker at up to 92 and the wordmark at 20 pixels tall, so 128-pixel icons,
 * a 192-pixel sticker and a 40-pixel wordmark cover a 3x or 2x screen at a
 * fraction of the bytes. The files in
 * `assets/projects/source/` stay the canonical artwork; the derivatives are
 * never edited by hand and a test checks they are still derived.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const iconSize = 128;
export const wordmarkHeight = 40;
export const icons = [
  "mochifile",
  "ordelis",
  "refrain",
  "orbit",
  "yanawa",
  "morrowferry",
];
const dir = fileURLToPath(new URL("../assets/projects/", import.meta.url));
export const sourceOf = (name) => `${dir}source/${name}.webp`;
export const targetOf = (name) => `${dir}${name}.webp`;

/** Lossy WebP at high quality: the icons are painted, not flat. */
const WEBP = { quality: 88, effort: 6 };

export const stickerSize = 192;

/** Every derivative: its source file and how it is resized. */
export const derivatives = {
  ...Object.fromEntries(
    icons.map((name) => [name, { source: name, width: iconSize }]),
  ),
  "refrain-sticker": { source: "refrain", width: stickerSize },
  "mochifile-wordmark": {
    source: "mochifile-wordmark",
    height: wordmarkHeight,
  },
};

export const derive = (name) => {
  const { source, width, height } = derivatives[name];
  return sharp(sourceOf(source))
    .resize({
      ...(width ? { width, height: width } : { height }),
      kernel: "lanczos3",
    })
    .webp(WEBP)
    .toBuffer();
};

export const all = Object.keys(derivatives);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const name of all) await writeFile(targetOf(name), await derive(name));
}
