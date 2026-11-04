import Link from "next/link";
import { LeaderRow, Section } from "@raioviajante/design/components";
import { LOCALES, type LocaleId } from "../../../../site/locales";
import { featuredProjects } from "../../lib/projects";
import { routes } from "../../lib/routes";
import type { ReactNode } from "react";
import type { Project, ProjectsCopy } from "../../lib/projects";
import { ProjectIcon, StatusMark } from "./parts";
import "./cards.css";
import { projectsCopyFor } from "./copy";
import { FeaturedMini, type FeaturedId } from "./minis";

/** A project on the home page: the whole card links to its place on /projects. */
export function HomeProjectCard({
  project,
  href,
  copy,
  sketch,
}: {
  project: Project;
  href: string;
  copy: ProjectsCopy;
  sketch: ReactNode;
}) {
  const text = copy.projects[project.id];
  return (
    <Link
      className="pj-home-card"
      href={href}
      prefetch={false}
      data-sound="nav"
    >
      <span className="pj-tile__art">{sketch}</span>
      <span className="pj-home-card__row">
        <ProjectIcon
          project={project}
          size={30}
          className="pj-home-card__icon"
        />
        <span className="pj-home-card__text">
          <span className="pj-home-card__name">{project.name}</span>
          <span className="pj-home-card__tagline">{text.tagline}</span>
          <StatusMark stage={project.stage} className="pj-status is-small">
            {text.status}
          </StatusMark>
        </span>
        <span className="pj-home-card__arrow" aria-hidden="true">
          →
        </span>
      </span>
    </Link>
  );
}

/** The home page's project section (00.1). */
export function HomeProjects({ locale }: { locale: LocaleId }) {
  const copy = projectsCopyFor(locale);
  const { intlLocale } = LOCALES[locale];
  const page = routes.projects[locale]!;
  return (
    <Section
      number="00.1"
      title={copy.home.heading}
      id="projects-heading"
      index
    >
      <div className="pj-home">
        {featuredProjects.map((project) => (
          <HomeProjectCard
            key={project.id}
            project={project}
            href={`${page}#${project.id}`}
            copy={copy}
            sketch={
              <FeaturedMini
                id={project.id as FeaturedId}
                copy={copy.art}
                intlLocale={intlLocale}
              />
            }
          />
        ))}
      </div>
      <div className="pj-home-more">
        <LeaderRow
          linkComponent={Link}
          label={copy.home.more}
          value="02. →"
          href={page}
        />
      </div>
    </Section>
  );
}
