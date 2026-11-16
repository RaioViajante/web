import Link from "next/link";
import { LeaderRow, Section } from "@raioviajante/design/components";
import type { LocaleId } from "../../../../site/locales";
import { featuredProjects } from "../../lib/projects";
import { routes } from "../../lib/routes";
import { projectsCopyFor } from "./copy";
import { projectCards } from "./project-cards";

/** The home page's project section (00.1): the same cards as /projects. */
export function HomeProjects({ locale }: { locale: LocaleId }) {
  const copy = projectsCopyFor(locale);
  return (
    <Section
      number="00.1"
      title={copy.home.heading}
      id="projects-heading"
      index
    >
      <div className="pj-pks">{projectCards(locale, featuredProjects)}</div>
      <div className="pj-home-more">
        <LeaderRow
          linkComponent={Link}
          label={copy.home.more}
          value="02. →"
          href={routes.projects[locale]!}
        />
      </div>
    </Section>
  );
}
