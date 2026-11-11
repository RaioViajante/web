// The This site page's sections about Dump, Docs and Lab. English copy lives
// here; the Portuguese copy is `ptThisSite.otherSites` in pt.ts, same shape.

import { siteOrigins } from "../../../site/sites.ts";

export interface OtherSite {
  id: "dump" | "docs" | "lab";
  title: string;
  /** Where the host link goes; `hrefLang` only when it differs from the page. */
  link: { href: string; hrefLang?: "en" | "pt-BR" };
  /** Follows the host name: "dump.raioviajante.com holds …". */
  holds: string;
  built: readonly string[];
}

export const otherSites: readonly OtherSite[] = [
  {
    id: "dump",
    title: "Dump",
    link: { href: siteOrigins.dump },
    holds: "holds my writing, in English and Portuguese.",
    built: [
      "Next.js, React and TypeScript, like this site",
      "Posts written as MDX files in the repository",
      "An archive, tags and an RSS feed in each language",
      "Comments through giscus, which keeps them in GitHub Discussions",
    ],
  },
  {
    id: "docs",
    title: "Docs",
    link: { href: siteOrigins.docs },
    holds: "holds the technical documentation for my projects.",
    built: [
      "Astro, rendering the shared components to static pages",
      "Project pages written from each project's source code, not from its README",
      "Two pages about these sites themselves: their design language and repository conventions",
    ],
  },
  {
    id: "lab",
    title: "Lab",
    link: { href: siteOrigins.lab },
    holds: "holds interactive experiments and technical curiosities.",
    built: [
      "Astro, with small TypeScript scripts for each experiment",
      "Each experiment names the project and revision it comes from, or says it was written for the Lab as a teaching model",
      "A label says whether it runs in your browser, is simulated, or is source only",
    ],
  },
];
