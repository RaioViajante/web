import type { MetadataRoute } from "next";

import { getAllTags, getPublishedPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();

  const staticRoutes = ["/", "/archive", "/tags", "/about", "/uses"].map(
    (path) => ({ url: absoluteUrl(path) }),
  );

  const postRoutes = posts.map((post) => ({
    url: absoluteUrl(`/posts/${post.slug}`),
    lastModified: post.date,
  }));

  const tagRoutes = getAllTags().map(({ tag }) => ({
    url: absoluteUrl(`/tags/${encodeURIComponent(tag)}`),
  }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
