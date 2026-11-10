/**
 * Column spans of the Personal collage on its 12-column grid, as
 * app/gallery/gallery.css places each piece: [desktop, phone]. They give every
 * image a `sizes` hint close to its real width. tests/gallery-layout.test.mjs
 * keeps this table equal to the stylesheet.
 */
export const collageSpans: Record<
  string,
  readonly [desktop: number, phone: number]
> = {
  lab: [8, 12],
  portrait: [4, 8],
  castle: [8, 12],
  cow: [5, 6],
  cats: [7, 6],
  sunset: [10, 12],
  calves: [6, 6],
  hospital: [6, 6],
  mirror: [7, 12],
  ferry: [5, 12],
  "long-way-home": [10, 12],
  "songs-for-rain": [8, 12],
  "between-trees": [4, 6],
  "stillness-below": [4, 6],
  midnight: [4, 6],
  "quiet-bells": [4, 6],
};

/** The collage is at most 740px wide; below 760px it nearly fills the screen. */
export function collageSizes(id: string) {
  const [desktop, phone] = collageSpans[id] ?? [12, 12];
  const share = (span: number, whole: number) =>
    Math.round((span / 12) * whole);
  return `(max-width: 480px) ${share(phone, 92)}vw, (max-width: 760px) ${share(desktop, 92)}vw, ${share(desktop, 740)}px`;
}
