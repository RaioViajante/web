/**
 * Derives the images the case pages' social cards draw (social-image.tsx)
 * from the cases' committed WebP derivatives. The social renderer reads
 * neither WebP nor srcsets, so these are small JPEGs:
 *
 *   pnpm --filter @raioviajante/design social-art
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projects = new URL("../assets/projects/", import.meta.url);
const target = fileURLToPath(new URL("../assets/social/", import.meta.url));

/** Output name, source under assets/projects/, width. */
export const socialArt = [
  ["stucco-desktop.jpg", "stucco/desktop-home-1440.webp", 960],
  ["stucco-phone.jpg", "stucco/mobile-home-640.webp", 320],
  ["quadra-desktop.jpg", "quadra/desktop-dashboard-1440.webp", 960],
  ["quadra-phone.jpg", "quadra/mobile-login-640.webp", 320],
  ["quadra-background.jpg", "quadra/card-background-800.webp", 800],
];

export const derive = (source, width) =>
  sharp(fileURLToPath(new URL(source, projects)))
    .resize({ width, withoutEnlargement: true, kernel: "lanczos3" })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await mkdir(target, { recursive: true });
  for (const [name, source, width] of socialArt)
    await writeFile(`${target}${name}`, await derive(source, width));
}
