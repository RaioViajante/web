import { DEFAULT_LOCALE } from "../../../../site/locales";
import { siteOrigins } from "../../../../site/sites";
import type { SearchEntry } from "@raioviajante/design/search";
import { getPublishedPosts, withoutIdentityFrontmatter } from "@/lib/posts";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

export function GET() {
  const entries: SearchEntry[] = getPublishedPosts(DEFAULT_LOCALE).map(
    (post) => ({
      site: "dump",
      locale: DEFAULT_LOCALE,
      title: post.title,
      href: `${siteOrigins.dump}/posts/${post.slug}`,
      description: post.description,
      date: post.publishedAt,
      body: withoutIdentityFrontmatter(
        fs.readFileSync(
          path.join(process.cwd(), "content/posts", `${post.slug}.mdx`),
          "utf8",
        ),
      ).replace(/<[^>]*>|[{][^}]*[}]/g, " "),
    }),
  );
  return Response.json(entries, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
