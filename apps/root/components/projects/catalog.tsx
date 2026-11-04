// /projects/all: every project, filterable by kind. The route in app/ only
// chooses the locale.

import Link from "next/link";
import { LOCALES, type LocaleId } from "../../../../site/locales";
import { projectCategories, projects } from "../../lib/projects";
import { routes } from "../../lib/routes";
import { Email, ProjectTile } from "./cards";
import { projectsCopyFor } from "./copy";
import { MiniSketch } from "./catalog-minis";
import { ProjectCatalog } from "./ProjectCatalog";

/** /projects/all: every project, filterable by kind. */
export function AllProjectsBody({ locale }: { locale: LocaleId }) {
  const copy = projectsCopyFor(locale);
  const { intlLocale } = LOCALES[locale];
  const items = projects.map((project, index) => ({
    id: project.id,
    category: project.category,
    tile: (
      <ProjectTile
        project={project}
        number={index + 1}
        locale={locale}
        copy={copy}
        sketch={
          <MiniSketch id={project.id} copy={copy.art} intlLocale={intlLocale} />
        }
      />
    ),
  }));
  return (
    <section className="pj-catalog" aria-labelledby="every-project-heading">
      <h2 id="every-project-heading" className="rv-sr-only">
        {copy.all.heading}
      </h2>
      <ProjectCatalog
        items={items}
        label={copy.all.filters}
        filters={[
          { value: "all", label: copy.all.all },
          ...projectCategories.map((value) => ({
            value,
            label: copy.categories[value],
          })),
        ]}
        countOne={copy.all.count.one}
        countOther={copy.all.count.other}
      />
      <Email lead={copy.all.cta} />
    </section>
  );
}

/** The back link above the catalog's header. */
export function AllProjectsBack({ locale }: { locale: LocaleId }) {
  const copy = projectsCopyFor(locale);
  return (
    <Link
      className="pj-back"
      href={routes.projects[locale]!}
      prefetch={false}
      data-sound="nav"
    >
      <span aria-hidden="true">←</span> 02. {copy.all.back}
    </Link>
  );
}
