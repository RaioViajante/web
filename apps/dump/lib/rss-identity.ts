import { siteOrigins } from "../../../site/sites";
import type { LocaleId } from "../../../site/locales";
import type { Post } from "@/lib/posts";

/**
 * Content ids of the English posts that were in the live feed before the
 * localized-RSS migration (issue #48). Their GUID was the permalink, and each
 * contentId equals the slug that permalink was built from, so the original
 * GUID is reproduced from the contentId even if the slug later changes.
 * Pinned against the production capture in `tests/legacy-rss-identity.test.ts`.
 * Never edit an entry to "fix" a GUID, and never add one: new posts use
 * `rssGuid`'s tag form.
 */
export const LEGACY_ENGLISH_CONTENT_IDS: readonly string[] = [
  "a-toml-file-changed-what-sweep-was",
  "an-execution-is-more-than-a-row-in-a-database",
  "apparently-moving-a-file-has-edge-cases",
  "building-orbit",
  "gave-one-operation-more-than-one-deadline",
  "kept-building-and-stopped-writing-it-down",
  "maybe-this-can-be-something-someday",
  "my-project-cards-were-getting-ahead-of-my-projects",
  "split-my-internet-into-four-different-kinds-of-place",
  "started-designing-a-language-before-i-could-compile-one",
  "started-writing-down-the-failures-before-the-features",
  "there-is-no-printf-down-here",
];

/** Fixed year of the tag URI scheme; never changes, so GUIDs never change. */
const TAG_YEAR = 2026;

const productionHost = new URL(siteOrigins.dump).hostname;

/**
 * A feed item's GUID. Pre-migration English posts keep their original
 * permalink GUID. Every other version gets
 * `tag:<production host>,2026:post/<contentId>/<locale>`, derived from
 * `(contentId, locale)` only: not slug, title, date, build or deploy host.
 */
export function rssGuid(post: Pick<Post, "contentId" | "locale">): string {
  if (
    post.locale === "en" &&
    LEGACY_ENGLISH_CONTENT_IDS.includes(post.contentId)
  )
    return `${siteOrigins.dump}/posts/${post.contentId}`;
  return tagGuid(post.contentId, post.locale);
}

export function tagGuid(contentId: string, locale: LocaleId): string {
  return `tag:${productionHost},${TAG_YEAR}:post/${contentId}/${locale}`;
}
