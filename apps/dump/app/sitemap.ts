import type { MetadataRoute } from "next";

import { LOCALE_IDS } from "../../../site/locales";
import { postPath, tagPath } from "@/lib/inventory";
import { getAllTags, getPublishedPosts } from "@/lib/posts";
import { declaredPages } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = declaredPages()
    .filter(({ key }) => key !== "search")
    .map(({ path }) => ({ url: absoluteUrl(path) }));
  const postRoutes = LOCALE_IDS.flatMap((locale) =>
    getPublishedPosts(locale).map((post) => ({
      url: absoluteUrl(postPath(post)),
      ...(post.updatedAt ? { lastModified: post.updatedAt } : {}),
    })),
  );
  const tagRoutes = LOCALE_IDS.flatMap((locale) =>
    getAllTags(locale).map(({ slug }) => ({
      url: absoluteUrl(tagPath(locale, slug)),
    })),
  );
  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
