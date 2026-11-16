/**
 * Derives the Refrain card art from the approved handoff, which stays out of
 * the repository:
 *
 *   pnpm --filter @raioviajante/design refrain-art <handoff> <fonts>
 *
 * `<handoff>` holds `assets/refrain/` (paper and navy textures, the torn edge,
 * the cover photo and the app's touch icon). `<fonts>` holds the TrueType
 * files of the four typefaces as Google Fonts serves them (archivo-800,
 * instrument-serif, instrument-serif-italic, silkscreen, la-belle-aurore, all
 * `.ttf`) and their licenses combined in `OFL.txt`. Each typeface is cut down
 * to the characters the art draws, listed below, with HarfBuzz's subsetter,
 * and written as WOFF. The art is the one place these typefaces appear, as
 * Stucco's Barlow is for its card (docs/design-system.md,
 * apps/root/docs/design.md).
 */
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { deflateSync } from "node:zlib";
import sharp from "sharp";

const target = fileURLToPath(
  new URL("../assets/projects/refrain/", import.meta.url),
);
const iconSource = fileURLToPath(
  new URL("../assets/projects/source/refrain.webp", import.meta.url),
);

/**
 * Every character each typeface draws, in both languages. Root's tests check
 * that the art's copy stays inside these sets; extend a set and run the
 * script again before the art uses a new character.
 */
export const refrainFontText = {
  archivo: "refrain",
  silkscreen:
    "A MUSIC JOURNAL · KEPT BY HAND UM DIÁRIO MUSICAL · FEITO À MÃO GRACE · 1994",
  instrumentSerif: "Grace.",
  instrumentSerifItalic:
    "some songs take you back. algumas músicas levam a gente de volta. 1994",
  laBelleAurore:
    "( side A: the ones that stay ) ( lado A: as que ficam ) jeff buckley",
};

export const refrainFonts = [
  ["archivo-800", "archivo"],
  ["silkscreen", "silkscreen"],
  ["instrument-serif", "instrumentSerif"],
  ["instrument-serif-italic", "instrumentSerifItalic"],
  ["la-belle-aurore", "laBelleAurore"],
];

async function subsetter() {
  const require = createRequire(import.meta.url);
  const wasm = join(dirname(require.resolve("harfbuzzjs")), "hb-subset.wasm");
  const { instance } = await WebAssembly.instantiate(await readFile(wasm));
  const hb = instance.exports;
  return (font, text) => {
    const heap = () => new Uint8Array(hb.memory.buffer);
    const pointer = hb.malloc(font.byteLength);
    heap().set(font, pointer);
    const blob = hb.hb_blob_create(pointer, font.byteLength, 2, 0, 0);
    const face = hb.hb_face_create(blob, 0);
    hb.hb_blob_destroy(blob);
    const input = hb.hb_subset_input_create_or_fail();
    const unicodes = hb.hb_subset_input_unicode_set(input);
    for (const char of new Set(text))
      hb.hb_set_add(unicodes, char.codePointAt(0));
    const subset = hb.hb_subset_or_fail(face, input);
    hb.hb_subset_input_destroy(input);
    const result = hb.hb_face_reference_blob(subset);
    const offset = hb.hb_blob_get_data(result, 0);
    const length = hb.hb_blob_get_length(result);
    const out = Buffer.from(heap().slice(offset, offset + length));
    hb.hb_blob_destroy(result);
    hb.hb_face_destroy(subset);
    hb.hb_face_destroy(face);
    hb.free(pointer);
    if (!length) throw new Error("HarfBuzz could not subset the font");
    return out;
  };
}

const pad4 = (n) => (n + 3) & ~3;

/** Wraps an sfnt (TrueType/OpenType) font as WOFF 1.0, zlib per table. */
export function woff(sfnt) {
  const count = sfnt.readUInt16BE(4);
  const tables = [];
  for (let i = 0; i < count; i++) {
    const at = 12 + i * 16;
    const offset = sfnt.readUInt32BE(at + 8);
    const length = sfnt.readUInt32BE(at + 12);
    const data = sfnt.subarray(offset, offset + length);
    const packed = deflateSync(data, { level: 9 });
    tables.push({
      tag: sfnt.subarray(at, at + 4),
      checksum: sfnt.readUInt32BE(at + 4),
      length,
      data: packed.length < length ? packed : data,
    });
  }
  tables.sort((a, b) => Buffer.compare(a.tag, b.tag));
  const header = 44 + 20 * count;
  let size = header;
  for (const table of tables) size += pad4(table.data.length);
  const out = Buffer.alloc(size);
  out.write("wOFF", 0, "latin1");
  out.writeUInt32BE(sfnt.readUInt32BE(0), 4);
  out.writeUInt32BE(size, 8);
  out.writeUInt16BE(count, 12);
  out.writeUInt32BE(
    12 + 16 * count + tables.reduce((sum, t) => sum + pad4(t.length), 0),
    16,
  );
  out.writeUInt16BE(1, 20);
  let offset = header;
  tables.forEach((table, i) => {
    const at = 44 + i * 20;
    table.tag.copy(out, at);
    out.writeUInt32BE(offset, at + 4);
    out.writeUInt32BE(table.data.length, at + 8);
    out.writeUInt32BE(table.length, at + 12);
    out.writeUInt32BE(table.checksum, at + 16);
    table.data.copy(out, offset);
    offset += pad4(table.data.length);
  });
  return out;
}

async function webp(source, name, width, options = {}) {
  const data = await sharp(source)
    .resize({ width, withoutEnlargement: true, kernel: "lanczos3" })
    .webp({ quality: 74, effort: 6, ...options })
    .toBuffer();
  await writeFile(join(target, name), data);
}

async function main(handoff, fonts) {
  if (!handoff || !fonts)
    throw new Error("Pass the handoff folder and the fonts folder");
  const art = (file) => join(handoff, "assets/refrain", file);
  await rm(target, { recursive: true, force: true });
  await mkdir(join(target, "fonts"), { recursive: true });

  // Sized for a card at most ~370 CSS pixels wide on a 2x screen.
  await webp(art("paper-texture.jpg"), "paper.webp", 900, { quality: 62 });
  await webp(art("navy-texture.jpg"), "navy.webp", 600, { quality: 62 });
  await webp(art("torn-edge.png"), "torn-edge.webp", 960, { quality: 80 });
  await webp(art("grace-cover.jpg"), "grace.webp", 280, { quality: 78 });

  // The app's own touch icon is Refrain's icon; project-icons derives the
  // 128-pixel copy from this source.
  await sharp(art("touch-icon.png"))
    .webp({ lossless: true, effort: 6 })
    .toFile(iconSource);

  const subset = await subsetter();
  for (const [file, key] of refrainFonts) {
    const font = await readFile(join(fonts, `${file}.ttf`));
    await writeFile(
      join(target, "fonts", `${file}.woff`),
      woff(subset(font, refrainFontText[key])),
    );
  }
  await copyFile(join(fonts, "OFL.txt"), join(target, "fonts", "OFL.txt"));
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  await main(process.argv[2], process.argv[3]);
