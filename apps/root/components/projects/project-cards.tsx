// The project cards shared by /projects and the home page. Kept apart from
// featured.tsx so the home page never loads the cases' art.

import { LOCALES, type LocaleId } from "../../../../site/locales";
import { projects } from "../../lib/projects";
import { ProjectCard } from "./cards";
import { MiniSketch } from "./catalog-minis";
import { projectsCopyFor } from "./copy";

/** The cards of the given projects, in order. */
export function projectCards(locale: LocaleId, list = projects) {
  const copy = projectsCopyFor(locale);
  const { intlLocale } = LOCALES[locale];
  return list.map((project) => (
    <ProjectCard
      key={project.id}
      project={project}
      locale={locale}
      copy={copy}
      sketch={
        <MiniSketch
          id={project.id}
          copy={copy.art}
          intlLocale={intlLocale}
          size="card"
        />
      }
    />
  ));
}
