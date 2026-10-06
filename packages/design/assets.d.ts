/**
 * Static image imports for this package's own typecheck. Apps get their own
 * declarations (Next.js: StaticImageData, Astro: ImageMetadata); components
 * accept all of them through `StaticAsset` in components/art.tsx.
 */
declare module "*.png" {
  const asset: string | { src: string };
  export default asset;
}
declare module "*.webp" {
  const asset: string | { src: string };
  export default asset;
}
