import { notFoundSeo, pageMetadata, type PageSeo } from "../../../seo/metadata";
import {
  DEFAULT_LOCALE,
  LOCALE_IDS,
  LOCALES,
  type LocaleId,
} from "../../../site/locales";
import {
  postCounterparts,
  postPath,
  tagCounterparts,
  tagPath,
} from "./inventory";
import { getAllTags, getPublishedPosts, type Post } from "./posts";
import { dumpCopy } from "./copy";
import { declaredPages } from "./routes";
import { alternatesFor, site } from "./site";

export const staticPages: PageSeo[] = declaredPages().map(
  ({ key, locale, path, counterparts }) => {
    return { path, locale, counterparts, ...dumpCopy(locale).pageSeo[key] };
  },
);

export function postSeo(post: Post): PageSeo {
  return {
    path: postPath(post),
    locale: post.locale,
    counterparts: postCounterparts(post),
    title: post.title,
    description: post.description,
  };
}

export function getSeoPages(): PageSeo[] {
  return [
    ...staticPages,
    ...LOCALE_IDS.flatMap((locale) => getPublishedPosts(locale).map(postSeo)),
    ...LOCALE_IDS.flatMap((locale) =>
      getAllTags(locale).map(({ id, slug, label }) => ({
        path: tagPath(locale, slug),
        locale,
        counterparts: tagCounterparts(locale, id),
        title: dumpCopy(locale).tagPageSeo.title(label),
        description: dumpCopy(locale).tagPageSeo.description(label),
      })),
    ),
  ];
}

export const notFoundPages: PageSeo[] = LOCALE_IDS.map((locale) => ({
  ...notFoundSeo,
  ...dumpCopy(locale).notFound.metadata,
  path: `${LOCALES[locale].urlPrefix}${notFoundSeo.path}`,
  locale,
}));

export function metadataFor(page: PageSeo) {
  const metadata = pageMetadata(site.url, site.name, page);
  return {
    ...metadata,
    alternates: alternatesFor(
      page.path,
      metadata.alternates.languages,
      page.locale ?? DEFAULT_LOCALE,
    ),
  };
}

export function staticMetadata(path: string) {
  const page = staticPages.find((candidate) => candidate.path === path);
  if (!page) throw new Error(`Unknown page: ${path}`);
  return metadataFor(page);
}
