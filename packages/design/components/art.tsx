/**
 * Artwork every site uses, served from this package. Apps never copy these
 * files. Bundlers resolve the static imports below, whether they return a URL
 * string (Vite) or an object with `src` (Next.js). Gallery artwork lives in
 * gallery.ts so sites that do not show it never bundle it.
 */
import avatar from "../assets/character/avatar.png";
import searchCharacter from "../assets/search/search-character.png";
import searchHeadStatic from "../assets/search/head/static.png";
import searchNotFound from "../assets/search/not-found.png";
import notFound from "../assets/stickers/not-found.png";
import workOfArt from "../assets/stickers/work-of-art.png";

/** What a bundler returns for an image import: a URL, or an object with `src`. */
type StaticAsset = string | { src: string };

const url = (asset: StaticAsset) =>
  typeof asset === "string" ? asset : asset.src;
const image = (asset: StaticAsset, width: number, height: number) => ({
  src: url(asset),
  width,
  height,
});

/** Intrinsic sizes of the exported files; `Art` scales them by CSS. */
export const art = {
  avatar: image(avatar, 256, 256),
  searchCharacter: image(searchCharacter, 640, 640),
  searchHeadStatic: image(searchHeadStatic, 64, 64),
  searchNotFound: image(searchNotFound, 360, 360),
  notFound: image(notFound, 640, 829),
  workOfArt: image(workOfArt, 640, 1137),
} as const;

export type ArtName = keyof typeof art;

export interface ArtProps {
  name: ArtName;
  alt: string;
  /** Displayed size in CSS pixels; defaults to the intrinsic size. */
  width?: number;
  height?: number;
  /** Eager only for artwork above the fold. */
  priority?: boolean;
  className?: string;
}

/** An image with explicit dimensions (no layout shift), lazy below the fold. */
export function Art({
  name,
  alt,
  width,
  height,
  priority = false,
  className,
}: ArtProps) {
  const source = art[name];
  const w = width ?? source.width;
  const h =
    height ??
    (width
      ? Math.round((width * source.height) / source.width)
      : source.height);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- shared across Next.js and Astro
    <img
      src={source.src}
      alt={alt}
      width={w}
      height={h}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}
