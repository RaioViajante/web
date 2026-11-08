// /projects: the four featured projects with their interactive sketches, then
// client work. The route in app/ only chooses the locale.

import Link from "next/link";
import { Section } from "@raioviajante/design/components";
import { projectArt } from "@raioviajante/design/projects";
import { LOCALES, type LocaleId } from "../../../../site/locales";
import {
  clientCases,
  featuredProjects,
  type ProjectId,
  type ProjectsCopy,
} from "../../lib/projects";
import { routes } from "../../lib/routes";
import { ClientCaseCard, Email, FeaturedProject } from "./cards";
import { projectsCopyFor } from "./copy";
import { MochifileSketch } from "./MochifileSketch";
import { OrbitSketch } from "./OrbitSketch";
import { OrdelisSketch } from "./OrdelisSketch";
import { RefrainSketch } from "./RefrainSketch";
import { StuccoArt } from "./StuccoArt";
import "@raioviajante/design/project-art.css";
// The large sketches share rules and reduced-motion handling with the small ones.
import "./minis.css";
import "./sketches.css";

function Sketch({
  id,
  copy,
  intlLocale,
}: {
  id: ProjectId;
  copy: ProjectsCopy;
  intlLocale: string;
}) {
  switch (id) {
    case "mochifile":
      return (
        <MochifileSketch
          label={copy.art.label.mochifile}
          example={copy.art.example}
          text={copy.art.mochifile}
          intlLocale={intlLocale}
          wordmark={projectArt.mochifileWordmark}
        />
      );
    case "ordelis":
      return (
        <OrdelisSketch label={copy.art.label.ordelis} text={copy.art.ordelis} />
      );
    case "refrain":
      return <RefrainSketch copy={copy.art} />;
    case "orbit":
      return (
        <OrbitSketch
          label={copy.art.label.orbit}
          simulated={copy.art.simulated}
          text={copy.art.orbit}
          intlLocale={intlLocale}
        />
      );
    default:
      // Only the four featured projects have a large sketch.
      return null;
  }
}

/** /projects: the four projects with their sketches, then client work. */
export function ProjectsBody({ locale }: { locale: LocaleId }) {
  const copy = projectsCopyFor(locale);
  const { intlLocale } = LOCALES[locale];
  return (
    <>
      <Section number="02." title={copy.page.mine} id="my-projects-heading">
        <p className="pj-lead">{copy.page.lead}</p>
        <div className="pj-list">
          {featuredProjects.map((project, index) => (
            <FeaturedProject
              key={project.id}
              project={project}
              index={index}
              total={featuredProjects.length}
              locale={locale}
              copy={copy}
              sketch={
                <Sketch id={project.id} copy={copy} intlLocale={intlLocale} />
              }
            />
          ))}
        </div>
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

      <Section number="02.1" title={copy.page.clients} id="client-work-heading">
        <p className="pj-lead">{copy.page.clientsLead}</p>
        {clientCases.length ? (
          <div className="pj-cases">
            {clientCases.map((item, index) => (
              <ClientCaseCard
                key={item.id}
                item={item}
                index={index}
                locale={locale}
                copy={copy}
                art={<StuccoArt />}
              />
            ))}
            <div className="pj-empty">
              <span className="pj-case__tab" aria-hidden="true">
                {copy.page.caseLabel}{" "}
                {String(clientCases.length + 1).padStart(2, "0")}
              </span>
              <p className="pj-empty__title">{copy.page.caseSoon}</p>
              <p className="pj-empty__note">{copy.page.clientsEmptyNote}</p>
            </div>
          </div>
        ) : (
          <div className="pj-empty">
            <span className="pj-case__tab" aria-hidden="true">
              {copy.page.caseLabel}
            </span>
            <p className="pj-empty__title">{copy.page.clientsEmpty}</p>
            <p className="pj-empty__note">{copy.page.clientsEmptyNote}</p>
          </div>
        )}
        <Email lead={copy.page.cta} />
      </Section>
    </>
  );
}
