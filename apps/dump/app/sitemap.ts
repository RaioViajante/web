import type { MetadataRoute } from "next";

import { getAllTags, getPublishedPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();

  const staticRoutes = ["/", "/archive", "/tags", "/terms", "/privacy"].map(
    (path) => ({
      url: absoluteUrl(path),
    }),
  );

  // No lastModified: a post's frontmatter date is its publication date, not a
  // modification date, and nothing else records one. Add it here, and as the
  // BlogPosting dateModified, only if posts gain an explicit modified date.
  const postRoutes = posts.map((post) => ({
    url: absoluteUrl(`/posts/${post.slug}`),
  }));

  const tagRoutes = getAllTags().map(({ tag }) => ({
    url: absoluteUrl(`/tags/${encodeURIComponent(tag)}`),
  }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
