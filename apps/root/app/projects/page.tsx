import type { Metadata } from "next";
import { LeaderRow } from "../../components/LeaderRow";
import { SectionHeading } from "../../components/SectionHeading";
import { projects } from "../../lib/projects";

export const metadata: Metadata = { title: "projects" };

export default function Projects() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">projects</p>
        <h1>Projects</h1>
        <p className="rv-dek">
          things that survived long enough to deserve a name.
        </p>
      </div>
      <section className="rv-section" aria-labelledby="all-projects-heading">
        <SectionHeading
          id="all-projects-heading"
          number="02."
          title="Projects"
        />
        {projects.map((project) => (
          <article className="project-entry" key={project.name}>
            <LeaderRow
              name={<a href={project.href}>{project.name}</a>}
              note={project.status}
            />
            <p className="project-description">
              {project.description} · {project.stack} · {project.year}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
