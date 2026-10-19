import fs from "node:fs";
import path from "node:path";

import type { SearchEntry } from "@raioviajante/design/search";
import { siteOrigins } from "../../../site/sites";
import type { LocaleId } from "../../../site/locales";
import { postPath } from "./inventory";
import { getPublishedPosts, withoutIdentityFrontmatter } from "./posts";

export interface DumpSearchEntry extends SearchEntry {
  contentId: string;
}

export function searchEntries(locale: LocaleId): DumpSearchEntry[] {
  return getPublishedPosts(locale).map((post) => ({
    site: "dump",
    locale,
    contentId: post.contentId,
    title: post.title,
    href: siteOrigins.dump + postPath(post),
    description: post.description,
    date: post.publishedAt,
    body: withoutIdentityFrontmatter(
      fs.readFileSync(
        path.join(process.cwd(), "content/posts", `${post.slug}.mdx`),
        "utf8",
      ),
    ).replace(/<[^>]*>|[{][^}]*[}]/g, " "),
  }));
}
