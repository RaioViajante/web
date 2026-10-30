import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { sectionNumber } from "@raioviajante/design/sections";
import {
  labSuggestions,
  type LabSuggestion,
  type LabTarget,
} from "@/lib/lab-suggestions";
import {
  getPublishedPosts,
  sortPostsNewestFirst,
  type Post,
} from "@/lib/posts";

/**
 * Series are authored by `contentId`: membership and order belong to the
 * underlying work, so every localized version of a part is in its series.
 */
export const series = [
  {
    name: "jobs-mcp",
    contentIds: [
      "started-writing-down-the-failures-before-the-features",
      "gave-one-operation-more-than-one-deadline",
    ],
  },
  {
    name: "orbit",
    contentIds: [
      "building-orbit",
      "an-execution-is-more-than-a-row-in-a-database",
    ],
  },
  {
    name: "sweep",
    contentIds: [
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

/** The series a work belongs to, by `contentId`: every localized version of a part is in it. */
export function seriesOf(post: Post, list: typeof series = series) {
  return list.find((item) => item.contentIds.includes(post.contentId));
}

/**
 * Posts that share a tag with `post`, most shared first. Only published posts
 * of the post's own language, and never another version of the same work: a
 * counterpart is not "related", and no language is substituted for another.
 */
export function relatedPosts(post: Post, published: readonly Post[]) {
  const shared = (item: Post) =>
    item.tags.filter((tag) => post.tags.includes(tag)).length;
  return published
    .filter(
      (item) =>
        item.locale === post.locale &&
        !item.draft &&
        item.contentId !== post.contentId &&
        shared(item) > 0,
    )
    .sort((a, b) => shared(b) - shared(a))
    .slice(0, 3);
}

/** Chronological Previous/Next within the post's language, published only. Not series navigation. */
export function chronologicalNeighbours(
  post: Post,
  published: readonly Post[],
) {
  const posts = sortPostsNewestFirst(
    published.filter((item) => item.locale === post.locale && !item.draft),
  );
  const index = posts.findIndex((item) => item.contentId === post.contentId);
  return {
    previous: posts[index + 1] ?? null,
    next: posts[index - 1] ?? null,
  };
}

/** The Lab experiment that matches a post, by series or topic. */
function labTargetOf(post: Post): LabTarget | null {
  const currentSeries = seriesOf(post);
  return post.tags.includes("osdev")
    ? "boot-sector"
    : currentSeries?.name === "orbit"
      ? "execution-states"
      : currentSeries?.name === "sweep"
        ? "filename-classifier"
        : null;
}

/**
 * The automatic Lab suggestion for a post, in the post's own language. It
 * exists only when that Lab page is published in that language
 * (`lib/lab-suggestions.ts`); nothing from the other language is substituted.
 */
export function labForPost(post: Post): LabSuggestion | null {
  const target = labTargetOf(post);
  const suggestions: Partial<Record<LabTarget, LabSuggestion>> =
    labSuggestions[post.locale];
  return target ? (suggestions[target] ?? null) : null;
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
  const posts = sortPostsNewestFirst(getPublishedPosts(post.locale));
  const related = relatedPosts(post, posts);
  const { previous, next } = chronologicalNeighbours(post, posts);
  const currentSeries = seriesOf(post);
  const lab = labForPost(post);
  return {
    headings,
    minutes: Math.max(1, Math.ceil(words / 220)),
    related,
    previous,
    next,
    currentSeries,
    lab,
  };
}
