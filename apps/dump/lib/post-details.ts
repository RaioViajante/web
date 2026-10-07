import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { sectionNumber } from "@raioviajante/design/sections";
import {
  getPublishedPosts,
  sortPostsNewestFirst,
  type Post,
} from "@/lib/posts";

export const series = [
  {
    name: "jobs-mcp",
    slugs: [
      "started-writing-down-the-failures-before-the-features",
      "gave-one-operation-more-than-one-deadline",
    ],
  },
  {
    name: "orbit",
    slugs: ["building-orbit", "an-execution-is-more-than-a-row-in-a-database"],
  },
  {
    name: "sweep",
    slugs: [
      "apparently-moving-a-file-has-edge-cases",
      "a-toml-file-changed-what-sweep-was",
    ],
  },
];

/**
 * A heading's plain text: markdown code ticks, bold and `_emphasis_` markers
 * go, but underscores inside a word (`tmp_path`) are text and stay.
 */
export function headingText(raw: string) {
  return raw
    .replace(/[`*]/g, "")
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,:;!?]|$)/g, "$1$2");
}

/**
 * The id `rehype-slug` (github-slugger) gives the same heading, so the "on
 * this page" links match the rendered anchors: lowercase, keep letters, marks,
 * digits, connector punctuation (underscore) and hyphens, spaces to hyphens.
 */
export function headingSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "")
    .replace(/ /g, "-");
}

export function getPostDetails(post: Post) {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "content", "posts", `${post.slug}.mdx`),
    "utf8",
  );
  const content = matter(raw).content;
  const seen = new Map<string, number>();
  const headings = [...content.matchAll(/^## (.+)$/gm)].map((match, index) => {
    const title = headingText(match[1] ?? "");
    const base = headingSlug(title);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return {
      number: sectionNumber(index),
      title,
      id: count ? `${base}-${count}` : base,
    };
  });
  const words = content
    .replace(/```[\s\S]*?```/g, "")
    .trim()
    .split(/\s+/).length;
  const posts = sortPostsNewestFirst(getPublishedPosts());
  const index = posts.findIndex((item) => item.slug === post.slug);
  const related = posts
    .filter(
      (item) =>
        item.slug !== post.slug &&
        item.tags.some((tag) => post.tags.includes(tag)),
    )
    .sort((a, b) => {
      const score = (item: Post) =>
        item.tags.filter((tag) => post.tags.includes(tag)).length;
      return score(b) - score(a);
    })
    .slice(0, 3);
  const currentSeries = series.find((item) => item.slugs.includes(post.slug));
  const lab = post.tags.includes("osdev")
    ? {
        title: "Boot sector",
        href: "https://lab.raioviajante.com/experiments/boot-sector/",
      }
    : currentSeries?.name === "orbit"
      ? {
          title: "Execution states",
          href: "https://lab.raioviajante.com/experiments/execution-states/",
        }
      : currentSeries?.name === "sweep"
        ? {
            title: "Filename classifier",
            href: "https://lab.raioviajante.com/experiments/filename-classifier/",
          }
        : null;
  return {
    headings,
    minutes: Math.max(1, Math.ceil(words / 220)),
    related,
    previous: posts[index + 1] ?? null,
    next: posts[index - 1] ?? null,
    currentSeries,
    lab,
  };
}
