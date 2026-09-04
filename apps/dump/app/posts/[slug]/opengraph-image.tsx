import {
  loadOgFonts,
  OG_ACCENT,
  OG_FONT_MONO,
  OG_FONT_SERIF,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  OG_INK,
  OG_MUTED,
  ogDate,
  OG_PAPER,
  titleFontSize,
} from "@/lib/og-image";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { site } from "@/lib/site";

export const dynamicParams = false;

export const alt = `${site.name} — article preview`;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

interface ImageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Per-post Open Graph image: publication eyebrow, the real post title
 * (tiered font size so long titles wrap instead of shrinking away), and a
 * byline built only from real frontmatter (author, date) — no tags,
 * description, or invented data.
 */
export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  // Deferred so importing this module for its static exports (alt, size,
  // contentType, generateStaticParams) doesn't require next/og's runtime —
  // kept import()able in tests without loading Satori.
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
          fontFamily: OG_FONT_MONO,
          fontSize: 24,
          letterSpacing: 1,
          color: OG_ACCENT,
        }}
      >
        {site.name}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          alignItems: "flex-start",
          marginTop: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: OG_FONT_SERIF,
            fontWeight: 700,
            fontSize: titleFontSize(post.title),
            lineHeight: 1.15,
            color: OG_INK,
          }}
        >
          {post.title}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: OG_FONT_MONO,
          fontSize: 24,
          color: OG_MUTED,
        }}
      >
        {`${site.author} · ${ogDate(post.date)}`}
      </div>
    </div>,
    { ...OG_IMAGE_SIZE, fonts },
  );
}
