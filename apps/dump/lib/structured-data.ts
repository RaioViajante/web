import { socialUrl } from "../../../seo/metadata";
import {
  inLanguageOf,
  personRef,
  shippedLanguages,
  webPageRef,
  websiteId,
  websiteJsonLd,
} from "../../../seo/structured-data";

import type { Post } from "@/lib/posts";
import { postPath } from "@/lib/inventory";
import { publishedLocales } from "@/lib/routes";
import { absoluteUrl, site } from "@/lib/site";
import { tagPresentation } from "@/lib/tags";

/**
 * Minimal JSON-LD, derived from the same `site`/`Post` data that already
 * feeds ordinary metadata — not a separate source of truth. The author is the
 * shared person identity from `seo/structured-data.ts` (one `@id` across the
 * sites); serialization is the shared `jsonLdScript`.
 */

const blogId = () => `${site.url}/#blog`;

/** Home page: the `WebSite` and the `Blog` it contains, by the same person. */
export function homeJsonLd() {
  const languages = publishedLocales();
  return [
    websiteJsonLd(site.url, site.name, site.description, {
      author: true,
      languages,
    }),
    {
      "@type": "Blog" as const,
      "@id": blogId(),
      name: site.name,
      description: site.description,
      url: absoluteUrl("/"),
      inLanguage: shippedLanguages(languages),
      author: personRef(),
      isPartOf: { "@id": websiteId(site.url) },
    },
  ];
}

/**
 * Article-level `BlogPosting` for a published post. Only fields the project
 * genuinely has. The image is the post's generated social card.
 */
export function blogPostingJsonLd(post: Post) {
  const path = postPath(post);
  const url = absoluteUrl(path);
  return {
    "@type": "BlogPosting" as const,
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    url,
    mainEntityOfPage: webPageRef(url, post.locale),
    author: personRef(),
    inLanguage: inLanguageOf(post.locale),
    isPartOf: { "@id": blogId() },
    ...(post.tags.length
      ? {
          keywords: post.tags
            .map((tag) => tagPresentation(tag, post.locale).label)
            .join(", "),
        }
      : {}),
    image: socialUrl(site.url, path),
  };
}
