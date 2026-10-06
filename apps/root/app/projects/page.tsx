import type { Metadata } from "next";
import {
  LeaderRow,
  PageHeader,
  Section,
} from "@raioviajante/design/components";
import { RootShell } from "../../components/RootShell";
import { projects } from "../../lib/projects";

export const metadata: Metadata = { title: "projects" };

export default function Projects() {
  return (
    <RootShell current="/projects">
      <PageHeader
        label="projects"
        title="Projects"
        line="Tools, software experiments and writing."
      />
      <Section number="02." title="Projects" id="all-projects-heading">
        {projects.map((project) => {
          const repository = project.href.startsWith("https://github.com/");
          const address = project.href
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "");

          return (
            <article className="project-entry" key={project.name}>
              <LeaderRow
                label={project.name}
                value={project.status}
                href={project.href}
              />
              <p className="project-description">{project.description}</p>
              <p className="project-detail">
                <strong>Type:</strong> <span>{project.kind}</span>
              </p>
              <p className="project-detail">
                <strong>{repository ? "Repo:" : "URL:"}</strong>{" "}
                <a href={project.href} data-sound="nav">
                  {address}
                </a>
              </p>
            </article>
          );
        })}
      </Section>
    </RootShell>
  );
}
