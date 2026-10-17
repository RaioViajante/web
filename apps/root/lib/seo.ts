import { pageMetadata, type PageSeo } from "../../../seo/metadata";
import { DEFAULT_LOCALE, type LocaleId } from "../../../site/locales";
import { siteOrigins } from "../../../site/sites";
import { ptPageSeo } from "./pt";
import { counterpartsOf, declaredPages, routes, type RouteKey } from "./routes";
export const origin = siteOrigins.root;

/** The English title and description of every Root page. */
const english: Record<RouteKey, { title: string; description: string }> = {
  home: {
    title: "raioviajante",
    description:
      "Personal home of RaioViajante: projects, technical writing, artwork and things built out of curiosity.",
  },
  about: {
    title: "about",
    description:
      "About RaioViajante, curiosity, computing and building things independently.",
  },
  projects: {
    title: "projects",
    description:
      "Software projects and experiments by RaioViajante, from tools to programming languages.",
  },
  contact: {
    title: "contact",
    description:
      "Get in touch with RaioViajante by email and find public profiles.",
  },
  gallery: {
    title: "gallery",
    description:
      "A personal collection of character artwork, illustrations and visual experiments.",
  },
  "this-site": {
    title: "this site",
    description:
      "How raioviajante.com is built, designed and connected to dump, docs and lab.",
  },
  setup: {
    title: "setup",
    description:
      "The computers, tools and software in RaioViajante\u2019s working setup.",
  },
  terms: {
    title: "terms of use",
    description:
      "Terms of Use for raioviajante.com: scope, content, code and external destinations.",
  },
  privacy: {
    title: "privacy policy",
    description:
      "Privacy Policy for raioviajante.com: preferences, data, contact and your rights.",
  },
  search: {
    title: "Search",
    description:
      "Search RaioViajante\u2019s pages, projects and the wider ecosystem.",
  },
};

const content = (key: RouteKey, locale: LocaleId) =>
  locale === DEFAULT_LOCALE ? english[key] : ptPageSeo[key];

/** Every declared page, in every locale it exists, with its real counterparts. */
export const allPages: PageSeo[] = declaredPages().map(
  ({ key, locale, path, counterparts }) => {
    const copy = content(key, locale);
    if (!copy)
      throw new Error(`Route "${key}" is declared in ${locale} without copy`);
    return { path, ...copy, locale, counterparts };
  },
);

/** The English pages (with the Portuguese counterparts that exist). */
export const pages: PageSeo[] = allPages.filter(
  (page) => page.locale === DEFAULT_LOCALE,
);

export function metadataFor(path: string) {
  const page = allPages.find((page) => page.path === path);
  if (!page) throw new Error(`Unknown page: ${path}`);
  return pageMetadata(origin, "raioviajante", page);
}

export { counterpartsOf, routes };
