import type { MetadataRoute } from "next";

import { DEFAULT_LOCALE } from "../../../site/locales";
import { getAllTags, getPublishedPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts(DEFAULT_LOCALE);

  const staticRoutes = ["/", "/archive", "/tags", "/terms", "/privacy"].map(
    (path) => ({
      url: absoluteUrl(path),
    }),
  );

  const postRoutes = posts.map((post) => ({
    url: absoluteUrl(`/posts/${post.slug}`),
    ...(post.updatedAt ? { lastModified: post.updatedAt } : {}),
  }));

  const tagRoutes = getAllTags(DEFAULT_LOCALE).map(({ slug }) => ({
    url: absoluteUrl(`/tags/${encodeURIComponent(slug)}`),
  }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
