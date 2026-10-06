import { socialUrl } from "@raioviajante/design/seo";
import {
  personRef,
  websiteId,
  websiteJsonLd,
} from "../../../seo/structured-data";

import type { Post } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";

/**
 * Minimal JSON-LD, derived from the same `site`/`Post` data that already
 * feeds ordinary metadata — not a separate source of truth. The author is the
 * shared person identity from `seo/structured-data.ts` (one `@id` across the
 * sites); serialization is the shared `jsonLdScript`.
 */

const blogId = () => `${site.url}/#blog`;

/** Home page: the `WebSite` and the `Blog` it contains, by the same person. */
export function homeJsonLd() {
  return [
    websiteJsonLd(site.url, site.name, site.description),
    {
      "@type": "Blog" as const,
      "@id": blogId(),
      name: site.name,
      description: site.description,
      url: absoluteUrl("/"),
      inLanguage: site.locale,
      author: personRef(),
      isPartOf: { "@id": websiteId(site.url) },
    },
  ];
}

/**
 * Article-level `BlogPosting` for a published post. Only fields the project
 * genuinely has: `datePublished` is the frontmatter date; there is no
 * modification date, so no `dateModified`, and no publisher, logo or other
 * invented data. The image is the post's generated social card.
 */
export function blogPostingJsonLd(post: Post) {
  const url = absoluteUrl(`/posts/${post.slug}`);
  return {
    "@type": "BlogPosting" as const,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url,
    mainEntityOfPage: { "@type": "WebPage" as const, "@id": url },
    author: personRef(),
    inLanguage: site.locale,
    isPartOf: { "@id": blogId() },
    ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
    image: socialUrl(site.url, `/posts/${post.slug}`),
  };
}
