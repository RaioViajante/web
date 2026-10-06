import type { SearchEntry } from "@raioviajante/design/search";
import { getPublishedPosts } from "@/lib/posts";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

export function GET() {
  const entries: SearchEntry[] = getPublishedPosts().map((post) => ({
    site: "dump",
    title: post.title,
    href: `https://dump.raioviajante.com/posts/${post.slug}`,
    description: post.description,
    date: post.date,
    body: fs
      .readFileSync(
        path.join(process.cwd(), "content/posts", `${post.slug}.mdx`),
        "utf8",
      )
      .replace(/<[^>]*>|[{][^}]*[}]/g, " "),
  }));
  return Response.json(entries, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
