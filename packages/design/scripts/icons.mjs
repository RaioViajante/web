/**
 * Builds every site icon from one artwork file and copies the set to the
 * fixed URLs each host serves (`/favicon.ico`, `/apple-touch-icon.png`, …).
 * Run after changing `assets/icons/source.png`:
 *
 *   pnpm --filter @raioviajante/design icons
 *
 * The app copies are generated, never edited; a test checks they match.
 */
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { appCopies } from "./icon-copies.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const icons = `${root}assets/icons/`;
const source = `${icons}source.png`;

// Opaque icons (iOS, Android maskable) sit on the page background.
const tokens = await readFile(`${root}styles/tokens.css`, "utf8");
const bg = tokens.match(/--bg:\s*(#[0-9a-f]{6});/i)?.[1];
if (!bg) throw new Error("Missing --bg in tokens.css");

/** Palette PNGs: a fraction of the size, no visible loss on flat artwork. */
const PNG = { palette: true, quality: 95, compressionLevel: 9, effort: 10 };
const png = (size) =>
  sharp(source).resize(size, size, { fit: "contain", background: "#0000" });

/** The artwork scaled to `scale` of the canvas, centered on the background. */
async function onBackground(size, scale) {
  const art = await png(Math.round(size * scale))
    .png(PNG)
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: art, gravity: "centre" }])
    .png(PNG)
    .toBuffer();
}

/** An ICO file holding PNG images (supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const outputs = {
  "favicon.ico": ico(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({
        size,
        data: await png(size).png(PNG).toBuffer(),
      })),
    ),
  ),
  "icon.png": await png(512).png(PNG).toBuffer(),
  "icon-192.png": await png(192).png(PNG).toBuffer(),
  "apple-touch-icon.png": await onBackground(180, 0.86),
  // Android crops maskable icons to a circle: keep the art in the safe zone.
  "icon-maskable.png": await onBackground(512, 0.72),
};
for (const [name, data] of Object.entries(outputs)) {
  await writeFile(`${icons}${name}`, data);
}

for (const [target, name] of Object.entries(appCopies)) {
  await copyFile(`${icons}${name}`, `${root}../../${target}`);
}
console.log(
  `Wrote ${Object.keys(outputs).length} icons and ${Object.keys(appCopies).length} app copies.`,
);
