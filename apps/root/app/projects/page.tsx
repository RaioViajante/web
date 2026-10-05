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
        <p className="rv-dek">Tools, software experiments and writing.</p>
      </div>
      <section className="rv-section" aria-labelledby="all-projects-heading">
        <SectionHeading
          id="all-projects-heading"
          number="02."
          title="Projects"
        />
        {projects.map((project) => {
          const repository = project.href.startsWith("https://github.com/");
          const address = project.href
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "");

          return (
            <article className="project-entry" key={project.name}>
              <LeaderRow
                name={<a href={project.href}>{project.name}</a>}
                note={project.status}
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
      </section>
    </>
  );
}
