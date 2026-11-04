/**
 * Project icons and the Mochifile wordmark, used by Root's projects pages and
 * home. They live here like all artwork, outside gallery.ts and art.tsx, so
 * pages that do not show projects never bundle them. The files are 128-pixel
 * derivatives (192 for the Refrain sticker, 40 pixels tall for the wordmark)
 * of `assets/projects/source/`, made by
 * `pnpm --filter @raioviajante/design project-icons`.
 */
import mochifile from "../assets/projects/mochifile.webp";
import ordelis from "../assets/projects/ordelis.webp";
import refrain from "../assets/projects/refrain.webp";
import orbit from "../assets/projects/orbit.webp";
import yanawa from "../assets/projects/yanawa.webp";
import morrowferry from "../assets/projects/morrowferry.webp";
import refrainSticker from "../assets/projects/refrain-sticker.webp";
import mochifileWordmark from "../assets/projects/mochifile-wordmark.webp";

type StaticAsset = string | { src: string };

const url = (asset: StaticAsset) =>
  typeof asset === "string" ? asset : asset.src;
const image = (asset: StaticAsset, width: number, height: number) => ({
  src: url(asset),
  width,
  height,
});

/** Square project icons, by project id. */
export const projectIcons = {
  mochifile: image(mochifile, 128, 128),
  ordelis: image(ordelis, 128, 128),
  refrain: image(refrain, 128, 128),
  orbit: image(orbit, 128, 128),
  yanawa: image(yanawa, 128, 128),
  morrowferry: image(morrowferry, 128, 128),
} as const;

export type ProjectIconName = keyof typeof projectIcons;

/** Other project artwork drawn inside the cards. */
export const projectArt = {
  refrainSticker: image(refrainSticker, 192, 192),
  mochifileWordmark: image(mochifileWordmark, 216, 40),
} as const;
