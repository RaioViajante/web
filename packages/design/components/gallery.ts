/** Gallery artwork (root only). Kept apart from art.tsx so other sites never bundle it. */
import blackCats from "../assets/gallery/black-cats.webp";
import calvesPlaying from "../assets/gallery/calves-playing.webp";
import characterStickerSheet from "../assets/gallery/character-sticker-sheet.webp";
import cowMuhh from "../assets/gallery/cow-muhh.webp";
import ferrymanBoat from "../assets/gallery/ferryman-boat.webp";
import graveyardRun from "../assets/gallery/graveyard-run.webp";
import hospitalBed from "../assets/gallery/hospital-bed.webp";
import laboratory from "../assets/gallery/laboratory.webp";
import mirrorDonkey from "../assets/gallery/mirror-donkey.webp";
import portraitOfMidnight from "../assets/gallery/portrait-of-midnight.webp";
import purplePortrait from "../assets/gallery/purple-portrait.webp";
import somethingBetweenTrees from "../assets/gallery/something-between-trees.webp";
import songsForRain from "../assets/gallery/songs-for-the-rain.webp";
import sunsetGuitar from "../assets/gallery/sunset-guitar.webp";
import longWayHome from "../assets/gallery/the-long-way-home.webp";
import stillnessBelow from "../assets/gallery/the-stillness-below.webp";
import quietBells from "../assets/gallery/when-the-bells-go-quiet.webp";

import stickerPreview from "../assets/gallery/branding-stickers-preview.avif";
import brandingStickers from "../assets/gallery/branding-stickers.webp";
import frameSheet from "../assets/gallery/avatar-frames.webp";
import profileHeadphones from "../assets/gallery/profile-headphones.png";
import profileHmm from "../assets/gallery/profile-hmm.png";
import profileLaptop from "../assets/gallery/profile-laptop.png";

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
  characterStickerSheet: image(characterStickerSheet, 1122, 1402),
  cowMuhh: image(cowMuhh, 1536, 1024),
  ferrymanBoat: image(ferrymanBoat, 1448, 1086),
  graveyardRun: image(graveyardRun, 1600, 900),
  hospitalBed: image(hospitalBed, 1600, 900),
  laboratory: image(laboratory, 1600, 900),
  longWayHome: image(longWayHome, 1448, 1086),
  mirrorDonkey: image(mirrorDonkey, 1448, 1086),
  portraitOfMidnight: image(portraitOfMidnight, 941, 1672),
  purplePortrait: image(purplePortrait, 941, 1672),
  quietBells: image(quietBells, 1024, 1536),
  somethingBetweenTrees: image(somethingBetweenTrees, 1086, 1448),
  songsForRain: image(songsForRain, 1536, 1024),
  stillnessBelow: image(stillnessBelow, 1086, 1448),
  sunsetGuitar: image(sunsetGuitar, 1600, 900),
} as const;

export type GalleryName = keyof typeof gallery;

export const galleryBranding = {
  stickers: image(brandingStickers, 2160, 1800),
  stickerPreview: image(stickerPreview, 1080, 900),
  frames: image(frameSheet, 2400, 240),
  profileHeadphones: image(profileHeadphones, 1254, 1254),
  profileHmm: image(profileHmm, 1254, 1254),
  profileLaptop: image(profileLaptop, 1254, 1254),
} as const;
