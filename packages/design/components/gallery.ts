/** Gallery artwork (root only). Kept apart from art.tsx so other sites never bundle it. */
import blackCats from "../assets/gallery/black-cats.webp";
import calvesPlaying from "../assets/gallery/calves-playing.webp";
import cowMuhh from "../assets/gallery/cow-muhh.webp";
import graveyardRun from "../assets/gallery/graveyard-run.webp";
import hospitalBed from "../assets/gallery/hospital-bed.webp";
import laboratory from "../assets/gallery/laboratory.webp";
import mirrorDonkey from "../assets/gallery/mirror-donkey.webp";
import purplePortrait from "../assets/gallery/purple-portrait.webp";
import sunsetGuitar from "../assets/gallery/sunset-guitar.webp";

type StaticAsset = string | { src: string };
const image = (asset: StaticAsset, width: number, height: number) => ({
  src: typeof asset === "string" ? asset : asset.src,
  width,
  height,
});

/** Intrinsic sizes of the exported files. The work-of-art sticker is in `art`. */
export const gallery = {
  blackCats: image(blackCats, 1536, 1024),
  calvesPlaying: image(calvesPlaying, 1448, 1086),
  cowMuhh: image(cowMuhh, 1536, 1024),
  graveyardRun: image(graveyardRun, 1600, 900),
  hospitalBed: image(hospitalBed, 1600, 900),
  laboratory: image(laboratory, 1600, 900),
  mirrorDonkey: image(mirrorDonkey, 1448, 1086),
  purplePortrait: image(purplePortrait, 941, 1672),
  sunsetGuitar: image(sunsetGuitar, 1600, 900),
} as const;

export type GalleryName = keyof typeof gallery;
