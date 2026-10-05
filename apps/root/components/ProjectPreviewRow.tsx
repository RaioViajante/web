import { LeaderRow } from "./LeaderRow";
import type { Project } from "../lib/projects";

export function ProjectPreviewRow({ project }: { project: Project }) {
  const tooltipId = `preview-${project.name.toLowerCase()}`;

  return (
    <div className="project-preview-row">
      <LeaderRow
        name={
          <a href={project.href} aria-describedby={tooltipId}>
            {project.name}
          </a>
        }
        note={project.status}
      />
      <div className="project-preview" id={tooltipId} role="tooltip">
        <p>{project.description}</p>
        <p className="project-preview-meta">
          {project.stack} · {project.year}
        </p>
      </div>
    </div>
  );
}
