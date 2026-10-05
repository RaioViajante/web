import { PreviewRow } from "./PreviewRow";
import type { Project } from "../lib/projects";

export function ProjectPreviewRow({ project }: { project: Project }) {
  const tooltipId = `preview-${project.name.toLowerCase()}`;

  return (
    <PreviewRow
      id={tooltipId}
      label={project.name}
      href={project.href}
      note={project.status}
      description={project.description}
      meta={`${project.stack} · ${project.year}`}
    />
  );
}
