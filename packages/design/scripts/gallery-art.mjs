/** Regenerate the Gallery's small display atlas; keep the supplied original for
 * the viewer and downloads. Run from any directory with Node 24.
 */
import sharp from "sharp";
const source = new URL(
  "../assets/gallery/branding-stickers.webp",
  import.meta.url,
);
const target = new URL(
  "../assets/gallery/branding-stickers-preview.avif",
  import.meta.url,
);
await sharp(source.pathname)
  .resize(1080)
  .avif({ quality: 43, effort: 7 })
  .toFile(target.pathname);
