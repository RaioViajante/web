import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { isLocaleId, localeById, type LocaleId } from "../../../site/locales";
import {
  taxonomy as defaultTaxonomy,
  tagPresentation,
  type TagId,
  type Taxonomy,
} from "@/lib/tags";
import {
  isPublishedPost,
  isValidContentId,
  parseFrontmatter,
  slugFromFilename,
  type PostFrontmatter,
} from "./content-schema";

export { parseFrontmatter, slugFromFilename, type PostFrontmatter };

/** A post version's frontmatter plus its URL slug (the filename without extension). */
export interface Post extends PostFrontmatter {
  slug: string;
}

/** A tag, in one locale, with how many published posts of that locale carry it. */
export interface TagCount {
  id: TagId;
  label: string;
  slug: string;
  count: number;
}

export const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");

/** Lowercase letters/digits in hyphen-separated groups. Used for slugs, tag ids and content ids. */
const KEBAB_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The collection-level identity rules. For every work (`contentId`): one
 * version per locale, every version agreeing on `originalLocale` and on
 * `publishedAt` (the original's first publication), and a provenance record
 * in that locale (which may be a draft). Missing
 * translations are fine. Every tag a post uses must exist and have a
 * presentation in the post's own locale. Throws one error naming every
 * conflict; nothing is inferred or repaired.
 */
export function validatePostCollection(
  posts: readonly Post[],
  taxonomy: Taxonomy = defaultTaxonomy,
): void {
  const problems: string[] = [];
  const at = (post: Post) =>
    `"${post.slug}" (${post.contentId}, ${post.locale})`;
  const works = new Map<string, Post[]>();
  const slugs = new Map<string, Post>();
  for (const post of posts) {
    if (!isValidContentId(post.contentId))
      problems.push(`${at(post)}: invalid contentId "${post.contentId}"`);
    if (!isLocaleId(post.locale))
      problems.push(`${at(post)}: unsupported locale "${post.locale}"`);
    if (!isLocaleId(post.originalLocale))
      problems.push(
        `${at(post)}: unsupported originalLocale "${post.originalLocale}"`,
      );
    const slugKey = `${post.locale} ${post.slug}`;
    const sameSlug = slugs.get(slugKey);
    if (sameSlug)
      problems.push(
        `slug "${post.slug}" in ${post.locale} is used by both ${at(sameSlug)} and ${at(post)}`,
      );
    slugs.set(slugKey, post);
    works.set(post.contentId, [...(works.get(post.contentId) ?? []), post]);
    for (const tag of post.tags)
      if (!taxonomy.presentation(tag, post.locale))
        problems.push(
          `${at(post)}: tag "${tag}" is not defined for locale ${post.locale}`,
        );
  }
  for (const [contentId, versions] of works) {
    const seen = new Map<LocaleId, Post>();
    for (const version of versions) {
      const duplicate = seen.get(version.locale);
      if (duplicate)
        problems.push(
          `contentId "${contentId}" has two ${version.locale} versions: "${duplicate.slug}" and "${version.slug}"`,
        );
      seen.set(version.locale, version);
    }
    // A translation is not a new publication: every version of a work carries
    // the date the original first went public.
    const dates = new Set(versions.map((version) => version.publishedAt));
    if (dates.size > 1)
      problems.push(
        `contentId "${contentId}" versions disagree on publishedAt: ${versions
          .map((version) => `"${version.slug}" says ${version.publishedAt}`)
          .join(", ")}`,
      );
    const originals = new Set(
      versions.map((version) => version.originalLocale),
    );
    if (originals.size > 1)
      problems.push(
        `contentId "${contentId}" versions disagree on originalLocale: ${versions
          .map((version) => `"${version.slug}" says ${version.originalLocale}`)
          .join(", ")}`,
      );
    else {
      const [original] = originals;
      if (original && !seen.has(original))
        problems.push(
          `contentId "${contentId}" claims originalLocale ${original} but has no ${original} version (provenance record; it may be a draft)`,
        );
    }
  }
  if (problems.length)
    throw new Error(`Invalid post collection:\n- ${problems.join("\n- ")}`);
}

/**
 * The URL slug for a post file. Filenames are the single source of truth for
 * slugs, so the rule is strict: lowercase letters, digits, and hyphens.
 */
/**
 * A post file's text without the identity frontmatter lines (`contentId`,
 * `locale`, `originalLocale`). The search index has always searched the file
 * text; identity metadata is not content and must not become searchable words.
 */
export function withoutIdentityFrontmatter(raw: string): string {
  return raw.replace(/^---\n[\s\S]*?\n---/, (frontmatter) =>
    frontmatter.replace(/^(?:contentId|locale|originalLocale):.*\n/gm, ""),
  );
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
function byPublicationDateDesc(a: Post, b: Post): number {
  if (a.publishedAt !== b.publishedAt)
    return a.publishedAt < b.publishedAt ? 1 : -1;
  return a.title.localeCompare(b.title);
}

/** Return a new, canonically ordered post array without mutating the input. */
export function sortPostsNewestFirst(posts: readonly Post[]): Post[] {
  return [...posts].sort(byPublicationDateDesc);
}

/**
 * Every post version on disk, in every locale, drafts included, newest first.
 * This is the validated authoring view: pages must use the locale-explicit
 * queries below so languages never mix. An inconsistent collection throws.
 */
export function getAllPosts(
  directory: string = POSTS_DIRECTORY,
  taxonomy: Taxonomy = defaultTaxonomy,
): Post[] {
  if (!fs.existsSync(directory)) return [];
  const posts = fs
    .readdirSync(directory)
    .filter(isPostFile)
    .map((filename) => readPost(directory, filename));
  validatePostCollection(posts, taxonomy);
  return sortPostsNewestFirst(posts);
}

/** Published posts of one locale: drafts and other languages removed. */
export function getPublishedPosts(
  locale: LocaleId,
  directory: string = POSTS_DIRECTORY,
  taxonomy: Taxonomy = defaultTaxonomy,
): Post[] {
  return getAllPosts(directory, taxonomy).filter(
    (post) => post.locale === locale && isPublishedPost(post),
  );
}

/**
 * The version of a work in a locale, found by `contentId` and `locale` only:
 * never by slug, never falling back to another language. Drafts are returned
 * (check `draft`); undefined when that version does not exist.
 */
export function findPostVersion(
  posts: readonly Post[],
  contentId: string,
  locale: LocaleId,
): Post | undefined {
  return posts.find(
    (post) => post.contentId === contentId && post.locale === locale,
  );
}

export function getPostVersion(
  contentId: string,
  locale: LocaleId,
  directory: string = POSTS_DIRECTORY,
  taxonomy: Taxonomy = defaultTaxonomy,
): Post | undefined {
  return findPostVersion(getAllPosts(directory, taxonomy), contentId, locale);
}

/**
 * Published slugs of one locale to prerender. Drafts never receive routes;
 * undated editorial work lives outside the post collection entirely.
 */
export function getPostSlugs(
  locale: LocaleId,
  directory: string = POSTS_DIRECTORY,
  taxonomy: Taxonomy = defaultTaxonomy,
): string[] {
  return getPublishedPosts(locale, directory, taxonomy).map(
    (post) => post.slug,
  );
}

/** A post of this locale by its slug; a slug that exists only in another locale is not found. */
export function getPostBySlug(
  locale: LocaleId,
  slug: string,
  directory: string = POSTS_DIRECTORY,
  taxonomy: Taxonomy = defaultTaxonomy,
): Post | null {
  if (!KEBAB_PATTERN.test(slug)) return null;
  return (
    getAllPosts(directory, taxonomy).find(
      (post) => post.locale === locale && post.slug === slug,
    ) ?? null
  );
}

/** Distinct tags across one locale's published posts, most used first, in that locale's words. */
export function getAllTags(
  locale: LocaleId,
  directory: string = POSTS_DIRECTORY,
  taxonomy: Taxonomy = defaultTaxonomy,
): TagCount[] {
  const counts = new Map<TagId, number>();
  for (const post of getPublishedPosts(locale, directory, taxonomy)) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([id, count]) => ({
      id,
      ...tagPresentation(id, locale, taxonomy),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

/** One locale's published posts that carry a tag, by stable tag id. */
export function getPostsByTagId(
  locale: LocaleId,
  tagId: TagId,
  directory: string = POSTS_DIRECTORY,
  taxonomy: Taxonomy = defaultTaxonomy,
): Post[] {
  return getPublishedPosts(locale, directory, taxonomy).filter((post) =>
    post.tags.includes(tagId),
  );
}

/** The route form: a locale's tag slug resolves to the tag, then to its posts. */
export function getPostsByTag(
  locale: LocaleId,
  tagSlug: string,
  directory: string = POSTS_DIRECTORY,
  taxonomy: Taxonomy = defaultTaxonomy,
): Post[] {
  const id = taxonomy.idForSlug(locale, tagSlug);
  return id ? getPostsByTagId(locale, id, directory, taxonomy) : [];
}

/** e.g. "2026-09-03" -> "September 3, 2026". Timezone-independent. */
export function formatPostDate(date: string, locale: LocaleId = "en"): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(
    localeById(locale).intlLocale,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    },
  );
}

/** e.g. "2026-09-03" -> "September". Timezone-independent. */
export function formatPostMonth(date: string, locale: LocaleId = "en"): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(
    localeById(locale).intlLocale,
    {
      month: "long",
      timeZone: "UTC",
    },
  );
}
