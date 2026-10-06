import { pageMetadata, type PageSeo } from "@raioviajante/design/seo";
export const origin = "https://raioviajante.com";
export const pages: PageSeo[] = [
  {
    path: "/",
    title: "raioviajante",
    description:
      "Personal home of RaioViajante: projects, technical writing, artwork and things built out of curiosity.",
  },
  {
    path: "/about",
    title: "about",
    description:
      "About RaioViajante, curiosity, computing and building things independently.",
  },
  {
    path: "/projects",
    title: "projects",
    description:
      "Software projects and experiments by RaioViajante, from tools to programming languages.",
  },
  {
    path: "/contact",
    title: "contact",
    description:
      "Get in touch with RaioViajante by email and find public profiles.",
  },
  {
    path: "/gallery",
    title: "gallery",
    description:
      "A personal collection of character artwork, illustrations and visual experiments.",
  },
  {
    path: "/this-site",
    title: "this site",
    description:
      "How raioviajante.com is built, designed and connected to dump, docs and lab.",
  },
  {
    path: "/setup",
    title: "setup",
    description:
      "The computers, tools and software in RaioViajante\u2019s working setup.",
  },
  {
    path: "/terms",
    title: "terms of use",
    description:
      "Terms of Use for raioviajante.com: scope, content, code and external destinations.",
  },
  {
    path: "/privacy",
    title: "privacy policy",
    description:
      "Privacy Policy for raioviajante.com: preferences, data, contact and your rights.",
  },
  {
    path: "/search",
    title: "Search",
    description:
      "Search RaioViajante\u2019s pages, projects and the wider ecosystem.",
  },
];
export function metadataFor(path: string) {
  const page = pages.find((page) => page.path === path);
  if (!page) throw new Error(`Unknown page: ${path}`);
  return pageMetadata(origin, "raioviajante", page);
}
