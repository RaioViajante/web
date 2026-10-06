import {
  pageMetadata,
  notFoundSeo,
  type PageSeo,
} from "@raioviajante/design/seo";
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
    ...getPublishedPosts().map((post) => ({
      path: `/posts/${post.slug}`,
      title: post.title,
      description: post.description,
    })),
    ...getAllTags().map(({ tag }) => ({
      path: `/tags/${encodeURIComponent(tag)}`,
      title: `Posts tagged "${tag}"`,
      description: `Technical writing and project notes tagged "${tag}" on dump.`,
    })),
  ];
}
export function metadataFor(page: PageSeo) {
  return {
    ...pageMetadata(site.url, site.name, page),
    alternates: alternatesFor(page.path),
  };
}
export function staticMetadata(path: string) {
  const page = staticPages.find((page) => page.path === path);
  if (!page) throw new Error(`Unknown page: ${path}`);
  return metadataFor(page);
}
