/**
 * The images inside the Refrain card art (Root's projects pages and home),
 * derived from the approved handoff by
 * `pnpm --filter @raioviajante/design refrain-art`. Its typefaces and
 * textures are in `styles/refrain-art.css`.
 */
import grace from "../assets/projects/refrain/grace.webp";
import tornEdge from "../assets/projects/refrain/torn-edge.webp";

type StaticAsset = string | { src: string };

const url = (asset: StaticAsset) =>
  typeof asset === "string" ? asset : asset.src;

export const refrainArt = {
  /** The photo on the sleeve titled "Grace.": a curtain and its shadows. */
  cover: { src: url(grace), width: 280, height: 280 },
  /** The torn paper edge above the navy band. */
  tornEdge: { src: url(tornEdge), width: 960, height: 57 },
} as const;
