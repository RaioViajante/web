import { getPublishedPosts } from "@/lib/posts";
import { renderRssFeed } from "@/lib/rss";

/** Served as a static file at build time; regenerated on each deploy. */
export const dynamic = "force-static";

export function GET() {
  const body = renderRssFeed(getPublishedPosts("pt-BR"), "pt-BR");
  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
