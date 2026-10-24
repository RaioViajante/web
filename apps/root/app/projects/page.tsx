import { metadataFor } from "../../lib/seo";
import Link from "next/link";
import {
  LeaderRow,
  PageHeader,
  Section,
} from "@raioviajante/design/components";
import { RootShell } from "../../components/RootShell";
import { projects } from "../../lib/projects";

export const metadata = metadataFor("/projects");

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
            <article
              data-testid="project-entry"
              className="project-entry"
              key={project.name}
            >
              <LeaderRow
                linkComponent={Link}
                label={project.name}
                value={project.status}
                href={project.href}
              />
              <p className="project-description">{project.description}</p>
              <p data-testid="project-detail" className="project-detail">
                <strong>Type:</strong>{" "}
                <span data-testid="project-kind">{project.kind}</span>
              </p>
              <p data-testid="project-detail" className="project-detail">
                <strong>{repository ? "Repo:" : "URL:"}</strong>{" "}
                <a
                  data-testid="content-link"
                  href={project.href}
                  data-sound="nav"
                >
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
