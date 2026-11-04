import { projectIcons } from "@raioviajante/design/projects";
import type { LocaleId } from "../../../../site/locales";
import {
  projectLink,
  type Project,
  type ProjectStage,
  type ProjectsCopy,
} from "../../lib/projects";

/** A project's approved icon. Decorative: the name always sits beside it. */
export function ProjectIcon({
  project,
  size,
  className,
}: {
  project: Project;
  size: number;
  className?: string;
}) {
  if (!project.icon) return null;
  const icon = projectIcons[project.id as keyof typeof projectIcons];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a fixed 128px derivative, no optimizer needed
    <img
      className={className}
      src={icon.src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
    />
  );
}

/** The status word. The mark's shape (solid or dashed) repeats it for sighted readers. */
export function StatusMark({
  stage,
  children,
  className = "pj-status",
}: {
  stage: ProjectStage;
  children: string;
  className?: string;
}) {
  return (
    <span className={className} data-stage={stage}>
      <span className="pj-status__mark" aria-hidden="true" />
      {children}
    </span>
  );
}

/**
 * Where a project can be seen: an external link with its own label, or a
 * plain note when there is no public destination yet.
 */
export function ProjectAction({
  project,
  locale,
  copy,
  label,
  className,
}: {
  project: Project;
  locale: LocaleId;
  copy: ProjectsCopy;
  label?: string;
  className: string;
}) {
  const link = projectLink(project, locale);
  if (!link || !label)
    return <span className={`${className} is-none`}>{copy.noLink}</span>;
  const english = link.hrefLang !== locale;
  return (
    <a
      className={className}
      href={link.href}
      hrefLang={link.hrefLang}
      data-sound="nav"
    >
      <span className="pj-action__text">
        {label}
        {english ? copy.englishOnly : null}
        <span className="rv-sr-only">: {project.name}</span>
      </span>
      <span className="pj-action__arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}

export const pad = (value: number) => String(value).padStart(2, "0");
