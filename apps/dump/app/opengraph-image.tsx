import {
  loadOgFonts,
  OG_ACCENT,
  OG_FONT_MONO,
  OG_FONT_SERIF,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  OG_INK,
  OG_PAPER,
} from "@/lib/og-image";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

/** Site-level default Open Graph image: publication name and tagline only. */
export default async function Image() {
  // Deferred so importing this module for its static exports (alt, size,
  // contentType) doesn't require next/og's runtime — kept import()able in
  // tests without loading Satori.
  const [{ ImageResponse }, fonts] = await Promise.all([
    import("next/og"),
    loadOgFonts(),
  ]);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: 96,
        backgroundColor: OG_PAPER,
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: OG_FONT_SERIF,
          fontWeight: 700,
          fontSize: 104,
          color: OG_INK,
        }}
      >
        {site.name}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 20,
          fontFamily: OG_FONT_MONO,
          fontSize: 28,
          color: OG_ACCENT,
        }}
      >
        {site.tagline}
      </div>
    </div>,
    { ...OG_IMAGE_SIZE, fonts },
  );
}
