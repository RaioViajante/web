import type { ReactNode } from "react";
import type { LocaleId } from "../../../../site/locales";
import { CONTACT } from "../../../../site/sites";
import type { ClientCase, Project, ProjectsCopy } from "../../lib/projects";
import { routes } from "../../lib/routes";
import { pad, ProjectAction, ProjectIcon, StatusMark } from "./parts";
import "./cards.css";
import "./pages.css";

/** A project on /projects: its interactive sketch above name, kind, status, description and link. */
export function FeaturedProject({
  project,
  index,
  total,
  locale,
  copy,
  sketch,
}: {
  project: Project;
  index: number;
  total: number;
  locale: LocaleId;
  copy: ProjectsCopy;
  sketch: ReactNode;
}) {
  const text = copy.projects[project.id];
  const heading = `pj-${project.id}`;
  return (
    <article
      className="pj-card"
      id={project.id}
      aria-labelledby={heading}
      data-motion="card"
    >
      <div className="pj-card__art">
        <span className="pj-card__number" aria-hidden="true">
          {pad(index + 1)} / {pad(total)}
        </span>
        {sketch}
      </div>
      <div className="pj-card__body">
        <div className="pj-card__head">
          <ProjectIcon project={project} size={42} className="pj-card__icon" />
          <div className="pj-card__title">
            <h3 id={heading}>{project.name}</h3>
            <span className="pj-card__meta">{text.meta}</span>
          </div>
          <StatusMark stage={project.stage}>{text.status}</StatusMark>
        </div>
        <p className="pj-card__description">{text.description}</p>
        <div className="pj-card__foot">
          <ProjectAction
            project={project}
            locale={locale}
            copy={copy}
            label={text.action}
            className="pj-action"
          />
        </div>
      </div>
    </article>
  );
}

/** A project in the catalog on /projects/all. */
export function ProjectTile({
  project,
  number,
  locale,
  copy,
  sketch,
}: {
  project: Project;
  number: number;
  locale: LocaleId;
  copy: ProjectsCopy;
  sketch: ReactNode;
}) {
  const text = copy.projects[project.id];
  const heading = `pt-${project.id}`;
  return (
    <article
      className="pj-tile"
      id={project.id}
      aria-labelledby={heading}
      data-motion="card"
    >
      <div className="pj-tile__art">{sketch}</div>
      <div className="pj-tile__body">
        <p className="pj-tile__top">
          <span aria-hidden="true">№ {pad(number)}</span>
          <span>{text.meta}</span>
        </p>
        <div className="pj-tile__head">
          <ProjectIcon project={project} size={26} className="pj-tile__icon" />
          <h3 id={heading}>{project.name}</h3>
        </div>
        <p className="pj-tile__summary">{text.summary}</p>
        <div className="pj-tile__foot">
          <StatusMark stage={project.stage}>{text.status}</StatusMark>
          <ProjectAction
            project={project}
            locale={locale}
            copy={copy}
            label={text.actionShort}
            className="pj-action is-small"
          />
        </div>
      </div>
    </article>
  );
}

/**
 * A published client case. The link is a plain anchor on purpose: a client-side
 * navigation would keep this page's CSP, whose `frame-src 'none'` would block
 * the demo on the case page.
 */
export function ClientCaseCard({
  item,
  index,
  locale,
  copy,
  art,
}: {
  item: ClientCase;
  index: number;
  locale: LocaleId;
  copy: ProjectsCopy;
  art: ReactNode;
}) {
  const text = copy.cases[item.id];
  const heading = `case-${item.id}`;
  return (
    <article
      className="pj-card pj-case"
      id={item.id}
      aria-labelledby={heading}
      data-motion="card"
    >
      {art}
      <div className="pj-card__body">
        <div className="pj-card__head">
          <div className="pj-card__title">
            <h3 id={heading}>{item.client}</h3>
            <span className="pj-card__meta">
              {item.year} · {text.scope}
            </span>
          </div>
          <StatusMark stage="usable" className="pj-status pj-case__pill">
            {`${copy.page.caseLabel} ${pad(index + 1)}`}
          </StatusMark>
        </div>
        <p className="pj-card__description">{text.summary}</p>
        <div className="pj-card__foot">
          <a
            className="pj-action"
            href={routes[item.route][locale]!}
            data-sound="nav"
          >
            <span className="pj-action__text">{text.action}</span>
            <span className="pj-action__arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}

/** The closing line of the projects pages: an invitation to write. */
export function Email({ lead }: { lead: string }) {
  return (
    <p className="pj-cta">
      {lead}{" "}
      <a href={`mailto:${CONTACT.email}`} data-sound="nav">
        {CONTACT.email}
      </a>
      .
    </p>
  );
}
