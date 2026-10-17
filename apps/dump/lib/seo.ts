import { pageMetadata, notFoundSeo, type PageSeo } from "../../../seo/metadata";
import { DEFAULT_LOCALE } from "../../../site/locales";
import { getPublishedPosts, getAllTags } from "./posts";
import { site, alternatesFor } from "./site";
export const staticPages: PageSeo[] = [
  {
    path: "/",
    title: "dump \u2014 a memory dump, hopefully readable.",
    description:
      "Computer science notes, projects, devlogs, and technology writing by RaioViajante.",
  },
  {
    path: "/archive",
    title: "Archive",
    description: "Every post on dump, newest first, grouped by year and month.",
  },
  {
    path: "/tags",
    title: "Tags",
    description: "Browse dump posts by recurring topics and technologies.",
  },
  {
    path: "/terms",
    title: "Terms of Use",
    description: "The short version of how to use dump.raioviajante.com.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    description: "What dump.raioviajante.com stores and who sees it.",
  },
  {
    path: "/search",
    title: "Search",
    description:
      "Search posts on dump and pages across the RaioViajante ecosystem.",
  },
];
export function getSeoPages(): PageSeo[] {
  return [
    ...staticPages,
    notFoundSeo,
    ...getPublishedPosts(DEFAULT_LOCALE).map((post) => ({
      path: `/posts/${post.slug}`,
      title: post.title,
      description: post.description,
    })),
    ...getAllTags(DEFAULT_LOCALE).map(({ slug, label }) => ({
      path: `/tags/${encodeURIComponent(slug)}`,
      title: `Posts tagged "${label}"`,
      description: `Technical writing and project notes tagged "${label}" on dump.`,
    })),
  ];
}
export function metadataFor(page: PageSeo) {
  const metadata = pageMetadata(site.url, site.name, page);
  return {
    ...metadata,
    alternates: alternatesFor(page.path, metadata.alternates.languages),
  };
}
export function staticMetadata(path: string) {
  const page = staticPages.find((page) => page.path === path);
  if (!page) throw new Error(`Unknown page: ${path}`);
  return metadataFor(page);
}
