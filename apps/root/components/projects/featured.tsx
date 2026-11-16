// /projects: every project as a compact card, four up front and the rest
// behind "show more", then the cases. The route in app/ only chooses the
// locale.

import type { ReactNode } from "react";
import Link from "next/link";
import { Section } from "@raioviajante/design/components";
import type { LocaleId } from "../../../../site/locales";
import {
  cases,
  type CaseId,
  featuredProjects,
  projects,
} from "../../lib/projects";
import { routes } from "../../lib/routes";
import { CaseCard, Email } from "./cards";
import { projectsCopyFor } from "./copy";
import { MiniSketch } from "./catalog-minis";
import { MoreProjects } from "./MoreProjects";
import { projectCards } from "./project-cards";
import { QuadraArt } from "./QuadraArt";
import { StuccoArt } from "./StuccoArt";
import "@raioviajante/design/project-art.css";

/** Each case's card art; a new case without one is a type error. */
const caseArt: Record<CaseId, ReactNode> = {
  stucco: <StuccoArt />,
  quadra: <QuadraArt />,
};

/** /projects: the projects, then the cases. */
export function ProjectsBody({ locale }: { locale: LocaleId }) {
  const copy = projectsCopyFor(locale);
  const others = projects.filter((project) => !project.featured);
  return (
    <>
      <Section number="02." title={copy.page.mine} id="my-projects-heading">
        <p className="pj-lead">{copy.page.lead}</p>
        <MoreProjects
          first={projectCards(locale, featuredProjects)}
          rest={projectCards(locale, others, (project, art, intlLocale) => (
            <MiniSketch id={project.id} copy={art} intlLocale={intlLocale} />
          ))}
          more={copy.page.more.replace("{n}", String(others.length))}
          less={copy.page.less}
        />
        <Link
          className="pj-more"
          href={routes["projects-all"][locale]!}
          prefetch={false}
          data-sound="nav"
        >
          <span>{copy.page.viewAll}</span>
          <span className="pj-more__dots" aria-hidden="true" />
          <span className="pj-more__arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </Section>

      <Section number="02.1" title={copy.page.cases} id="cases-heading">
        <p className="pj-lead">{copy.page.casesLead}</p>
        <div className="pj-pks pj-cases">
          {cases.map((item, index) => (
            <CaseCard
              key={item.id}
              item={item}
              index={index}
              locale={locale}
              copy={copy}
              art={caseArt[item.id]}
            />
          ))}
        </div>
        <Email lead={copy.page.cta} />
      </Section>
    </>
  );
}
