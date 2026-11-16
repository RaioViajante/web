// The project cards shared by /projects and the home page. Kept apart from
// featured.tsx so the home page never loads the cases' art, and drawing only
// the featured projects' art itself so it never loads the catalog's.

import type { ReactNode } from "react";
import { LOCALES, type LocaleId } from "../../../../site/locales";
import type { Project, ProjectArtCopy } from "../../lib/projects";
import { ProjectCard } from "./cards";
import { projectsCopyFor } from "./copy";
import { FeaturedMini, type FeaturedId } from "./minis";
import { RefrainArt } from "./RefrainArt";

export type CardArt = (
  project: Project,
  copy: ProjectArtCopy,
  intlLocale: string,
) => ReactNode;

/** The art of the four featured projects, at card size. */
export const featuredArt: CardArt = (project, copy, intlLocale) =>
  project.id === "refrain" ? (
    <RefrainArt copy={copy.refrain} size="card" />
  ) : (
    <FeaturedMini
      id={project.id as FeaturedId}
      copy={copy}
      intlLocale={intlLocale}
    />
  );

/** The cards of the given projects, in order. */
export function projectCards(
  locale: LocaleId,
  list: readonly Project[],
  art: CardArt = featuredArt,
) {
  const copy = projectsCopyFor(locale);
  const { intlLocale } = LOCALES[locale];
  return list.map((project) => (
    <ProjectCard
      key={project.id}
      project={project}
      locale={locale}
      copy={copy}
      sketch={art(project, copy.art, intlLocale)}
    />
  ));
}
