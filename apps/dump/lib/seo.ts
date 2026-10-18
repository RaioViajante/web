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
import { ptCopy, ptPageSeo } from "./pt";
import { declaredPages, type RouteKey } from "./routes";
import { alternatesFor, site } from "./site";

const english: Record<RouteKey, { title: string; description: string }> = {
  home: {
    title: "dump — a memory dump, hopefully readable.",
    description:
      "Computer science notes, projects, devlogs, and technology writing by RaioViajante.",
  },
  archive: {
    title: "Archive",
    description: "Every post on dump, newest first, grouped by year and month.",
  },
  tags: {
    title: "Tags",
    description: "Browse dump posts by recurring topics and technologies.",
  },
  terms: {
    title: "Terms of Use",
    description: "The short version of how to use dump.raioviajante.com.",
  },
  privacy: {
    title: "Privacy Policy",
    description: "What dump.raioviajante.com stores and who sees it.",
  },
  search: {
    title: "Search",
    description:
      "Search posts on dump and pages across the RaioViajante ecosystem.",
  },
};

const copyFor = (key: RouteKey, locale: LocaleId) =>
  locale === DEFAULT_LOCALE ? english[key] : ptPageSeo[key];

export const staticPages: PageSeo[] = declaredPages().map(
  ({ key, locale, path, counterparts }) => {
    const copy = copyFor(key, locale);
    if (!copy)
      throw new Error(`Route "${key}" is declared in ${locale} without copy`);
    return { path, locale, counterparts, ...copy };
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
        title:
          locale === DEFAULT_LOCALE
            ? `Posts tagged "${label}"`
            : `Textos com a tag "${label}"`,
        description:
          locale === DEFAULT_LOCALE
            ? `Technical writing and project notes tagged "${label}" on dump.`
            : `Textos técnicos e notas de projeto com a tag "${label}" no dump.`,
      })),
    ),
  ];
}

export const notFoundPages: PageSeo[] = [
  { ...notFoundSeo, locale: DEFAULT_LOCALE },
  {
    ...notFoundSeo,
    ...ptCopy.notFound.metadata,
    path: `${LOCALES["pt-BR"].urlPrefix}${notFoundSeo.path}`,
    locale: "pt-BR",
  },
];

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
