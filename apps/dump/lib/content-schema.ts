import { isLocaleId, type LocaleId } from "../../../site/locales.ts";

/** Frontmatter every post file must declare (see `content/README.md`). */
export interface PostFrontmatter {
  /** Stable, locale-neutral identity shared by every version of one work. */
  contentId: string;
  /** The language of this version. */
  locale: LocaleId;
  /** The language the work was first written in. */
  originalLocale: LocaleId;
  title: string;
  description: string;
  /** This version's original publication date as `YYYY-MM-DD`. */
  publishedAt: string;
  /** Date of this version's latest meaningful revision, when one exists. */
  updatedAt?: string;
  /** Stable tag ids. May be empty. */
  tags: string[];
  /** When true, this version is excluded from every public inventory. */
  draft: boolean;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
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

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  if (value.startsWith("0000-")) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

/**
 * Validate raw YAML before either the content loader or route generator can
 * decide that a record is published. Keeping this parser dependency-free
 * makes the same publication rule available to the build-time generator.
 */
export function parseFrontmatter(data: unknown, slug: string): PostFrontmatter {
  if (!isRecord(data)) {
    throw new FrontmatterError(
      slug,
      "expected a YAML block at the top of the file",
    );
  }

  const {
    contentId,
    locale,
    originalLocale,
    title,
    description,
    publishedAt,
    updatedAt,
    tags,
    draft,
  } = data;

  if (typeof contentId !== "string" || !KEBAB_PATTERN.test(contentId)) {
    throw new FrontmatterError(
      slug,
      "`contentId` is required: lowercase letters, digits and hyphens, declared explicitly (not inferred from the filename)",
    );
  }
  if (!isLocaleId(locale)) {
    throw new FrontmatterError(
      slug,
      `\`locale\` is required and must be a supported locale (got ${JSON.stringify(locale)})`,
    );
  }
  if (!isLocaleId(originalLocale)) {
    throw new FrontmatterError(
      slug,
      `\`originalLocale\` is required and must be a supported locale (got ${JSON.stringify(originalLocale)})`,
    );
  }
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
  if (!isValidDate(publishedAt)) {
    throw new FrontmatterError(
      slug,
      "`publishedAt` is required and must be a valid `YYYY-MM-DD` string",
    );
  }
  if (updatedAt !== undefined && !isValidDate(updatedAt)) {
    throw new FrontmatterError(
      slug,
      "`updatedAt` must be a valid `YYYY-MM-DD` string",
    );
  }
  if (updatedAt !== undefined && updatedAt <= publishedAt) {
    throw new FrontmatterError(
      slug,
      "`updatedAt` must be later than `publishedAt`",
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
    contentId,
    locale,
    originalLocale,
    title,
    description,
    publishedAt,
    ...(updatedAt ? { updatedAt } : {}),
    tags: normalizedTags,
    draft: draft === true,
  };
}

/** The filename is the route slug and must follow the same rule everywhere. */
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

export function isValidContentId(value: string): boolean {
  return KEBAB_PATTERN.test(value);
}

/** The single publication-membership rule used by loaders and generators. */
export function isPublishedPost(post: Pick<PostFrontmatter, "draft">): boolean {
  return !post.draft;
}
