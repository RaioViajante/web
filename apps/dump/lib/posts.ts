import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

/** Frontmatter every post file must declare (see `content/README.md`). */
export interface PostFrontmatter {
  /** Human title, used verbatim in headings and metadata. */
  title: string;
  /** One or two sentences; used for previews, `<meta>` description, and RSS. */
  description: string;
  /** Publication date as `YYYY-MM-DD`. */
  date: string;
  /** Lowercase, URL-safe topic tags. May be empty. */
  tags: string[];
  /** When true, the post is hidden from listings and from production builds. */
  draft: boolean;
}

/** A post's frontmatter plus its URL slug (the filename without extension). */
export interface Post extends PostFrontmatter {
  slug: string;
}

/** A tag together with how many published posts carry it. */
export interface TagCount {
  tag: string;
  count: number;
}

export const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Lowercase letters/digits in hyphen-separated groups. Used for slugs and tags. */
const KEBAB_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class FrontmatterError extends Error {
  constructor(slug: string, message: string) {
    super(`Invalid frontmatter in "${slug}.mdx": ${message}`);
    this.name = "FrontmatterError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate raw parsed YAML into a typed `PostFrontmatter`. Throws a
 * `FrontmatterError` with an actionable message on any problem, so a broken
 * file fails the build instead of shipping half-rendered.
 */
export function parseFrontmatter(data: unknown, slug: string): PostFrontmatter {
  if (!isRecord(data)) {
    throw new FrontmatterError(
      slug,
      "expected a YAML block at the top of the file",
    );
  }

  const { title, description, date, tags, draft } = data;

  if (typeof title !== "string" || title.trim() === "") {
    throw new FrontmatterError(
      slug,
      "`title` is required and must be a non-empty string",
    );
  }
  if (typeof description !== "string" || description.trim() === "") {
    throw new FrontmatterError(
      slug,
      "`description` is required and must be a non-empty string",
    );
  }
  if (
    typeof date !== "string" ||
    !DATE_PATTERN.test(date) ||
    Number.isNaN(Date.parse(date))
  ) {
    throw new FrontmatterError(
      slug,
      "`date` is required and must be a valid `YYYY-MM-DD` string",
    );
  }

  let normalizedTags: string[] = [];
  if (tags !== undefined) {
    if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string")) {
      throw new FrontmatterError(slug, "`tags` must be a list of strings");
    }
    normalizedTags = tags
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
    for (const tag of normalizedTags) {
      if (!KEBAB_PATTERN.test(tag)) {
        throw new FrontmatterError(
          slug,
          `tag "${tag}" must be lowercase letters, digits, and hyphens`,
        );
      }
    }
  }

  if (draft !== undefined && typeof draft !== "boolean") {
    throw new FrontmatterError(slug, "`draft` must be a boolean");
  }

  return {
    title,
    description,
    date,
    tags: normalizedTags,
    draft: draft === true,
  };
}

/**
 * The URL slug for a post file. Filenames are the single source of truth for
 * slugs, so the rule is strict: lowercase letters, digits, and hyphens.
 */
export function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.mdx$/, "");
  if (filename === base || !KEBAB_PATTERN.test(base)) {
    throw new Error(
      `Invalid post filename "${filename}": name must be lowercase letters, ` +
        `digits, and hyphens with an .mdx extension (e.g. "my-first-boot-sector.mdx").`,
    );
  }
  return base;
}

/** Whether a directory entry is a post. Dot- and underscore-prefixed files
 * (e.g. the `_keep.mdx` build keeper) are ignored. */
function isPostFile(filename: string): boolean {
  return filename.endsWith(".mdx") && !/^[._]/.test(filename);
}

/** Read and validate a single post file. */
export function readPost(directory: string, filename: string): Post {
  const slug = slugFromFilename(filename);
  const raw = fs.readFileSync(path.join(directory, filename), "utf8");
  const { data } = matter(raw);
  return { slug, ...parseFrontmatter(data, slug) };
}

/** Newest first; ties broken by title for a stable order. */
function byDateDesc(a: Post, b: Post): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.title.localeCompare(b.title);
}

/** Every post on disk, drafts included, sorted newest first. */
export function getAllPosts(directory: string = POSTS_DIRECTORY): Post[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter(isPostFile)
    .map((filename) => readPost(directory, filename))
    .sort(byDateDesc);
}

/** Posts safe to show anywhere: drafts removed. */
export function getPublishedPosts(directory: string = POSTS_DIRECTORY): Post[] {
  return getAllPosts(directory).filter((post) => !post.draft);
}

/**
 * Slugs to prerender. Production builds only the published set, so a draft
 * 404s once deployed; `next dev` serves drafts so they can be previewed.
 */
export function getPostSlugs(directory: string = POSTS_DIRECTORY): string[] {
  const posts =
    process.env.NODE_ENV === "production"
      ? getPublishedPosts(directory)
      : getAllPosts(directory);
  return posts.map((post) => post.slug);
}

export function getPostBySlug(
  slug: string,
  directory: string = POSTS_DIRECTORY,
): Post | null {
  if (!KEBAB_PATTERN.test(slug)) return null;
  const filename = `${slug}.mdx`;
  if (!fs.existsSync(path.join(directory, filename))) return null;
  return readPost(directory, filename);
}

/** Distinct tags across published posts, most used first. */
export function getAllTags(directory: string = POSTS_DIRECTORY): TagCount[] {
  const counts = new Map<string, number>();
  for (const post of getPublishedPosts(directory)) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(
  tag: string,
  directory: string = POSTS_DIRECTORY,
): Post[] {
  const wanted = tag.toLowerCase();
  return getPublishedPosts(directory).filter((post) =>
    post.tags.includes(wanted),
  );
}

/** e.g. "2026-09-03" -> "September 3, 2026". Timezone-independent. */
export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
