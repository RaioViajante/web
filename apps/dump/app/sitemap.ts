import type { MetadataRoute } from "next";

import { LOCALE_IDS, type LocaleId } from "../../../site/locales";
import { postPath, tagPath } from "@/lib/inventory";
import { getAllTags, getPublishedPosts, type Post } from "@/lib/posts";
import { declaredPages } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

interface SitemapTag {
  locale: LocaleId;
  slug: string;
}

export function buildSitemap(
  posts: readonly Pick<Post, "locale" | "slug" | "updatedAt">[],
  tags: readonly SitemapTag[],
): MetadataRoute.Sitemap {
  const staticRoutes = declaredPages()
    .filter(({ key }) => key !== "search")
    .map(({ path }) => ({ url: absoluteUrl(path) }));
  const postRoutes = posts.map((post) => ({
    url: absoluteUrl(postPath(post)),
    ...(post.updatedAt ? { lastModified: post.updatedAt } : {}),
  }));
  const tagRoutes = tags.map(({ locale, slug }) => ({
    url: absoluteUrl(tagPath(locale, slug)),
  }));
  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(
    LOCALE_IDS.flatMap((locale) => getPublishedPosts(locale)),
    LOCALE_IDS.flatMap((locale) =>
      getAllTags(locale).map(({ slug }) => ({ locale, slug })),
    ),
  );
}
