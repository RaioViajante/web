import {
  LOCALE_IDS,
  localizedPath,
  type LocaleId,
} from "../../../site/locales";
import type { Counterpart, LocalizedRoute } from "../../../seo/locale";
import { getAllTags, getPublishedPosts, type Post } from "./posts";
import { declaredPages } from "./routes";
import { encodeTagSlug } from "./tag-route";
import { taxonomy } from "./tags";

export function postPath(post: Pick<Post, "locale" | "slug">): string {
  return localizedPath("dump", post.locale, `/posts/${post.slug}`);
}

export function tagPath(locale: LocaleId, slug: string): string {
  return localizedPath("dump", locale, `/tags/${encodeTagSlug(slug)}`);
}

export function postCounterparts(post: Post): Counterpart[] {
  return LOCALE_IDS.filter((locale) => locale !== post.locale).flatMap(
    (locale) => {
      const version = getPublishedPosts(locale).find(
        (candidate) => candidate.contentId === post.contentId,
      );
      return version ? [{ locale, path: postPath(version) }] : [];
    },
  );
}

export function tagCounterparts(
  locale: LocaleId,
  tagId: string,
): Counterpart[] {
  return LOCALE_IDS.filter((other) => other !== locale).flatMap((other) => {
    const presentation = taxonomy.presentation(tagId, other);
    if (!presentation) return [];
    const published = getAllTags(other).some(({ id }) => id === tagId);
    return published
      ? [{ locale: other, path: tagPath(other, presentation.slug) }]
      : [];
  });
}

/** Every public HTML page, from the static registry and published content. */
export function publishedPageInventory(): LocalizedRoute[] {
  const staticPages = declaredPages().map(({ locale, path, counterparts }) => ({
    locale,
    path,
    counterparts,
  }));
  const posts = LOCALE_IDS.flatMap((locale) =>
    getPublishedPosts(locale).map((post) => ({
      locale,
      path: postPath(post),
      counterparts: postCounterparts(post),
    })),
  );
  const tags = LOCALE_IDS.flatMap((locale) =>
    getAllTags(locale).map(({ id, slug }) => ({
      locale,
      path: tagPath(locale, slug),
      counterparts: tagCounterparts(locale, id),
    })),
  );
  return [...staticPages, ...posts, ...tags];
}

export function publishedPaths(): string[] {
  return publishedPageInventory().map(({ path }) => path);
}
