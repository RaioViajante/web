import type { Post } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";

/**
 * Minimal JSON-LD, derived from the same `site`/`Post` data that already
 * feeds ordinary metadata — not a separate source of truth, and not a
 * general structured-data framework.
 */

/** Site-level `WebSite`, rendered once from the root layout. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    description: site.description,
    url: site.url,
  };
}

/**
 * Article-level `BlogPosting` for a published post. Only fields the project
 * genuinely has: no dateModified, publisher, logo, or other invented data.
 */
export function blogPostingJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: absoluteUrl(`/posts/${post.slug}`),
    author: { "@type": "Person", name: site.author },
    image: absoluteUrl(`/posts/${post.slug}/opengraph-image`),
  };
}

/**
 * Serialize a JSON-LD object for embedding in a `<script
 * type="application/ld+json">`. Escapes `<` so a value can never prematurely
 * close the surrounding script tag.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
