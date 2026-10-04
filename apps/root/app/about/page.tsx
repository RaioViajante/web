import type { Metadata } from "next";
import { SectionHeading } from "../../components/SectionHeading";
import { projects } from "../../lib/projects";

export const metadata: Metadata = { title: "about" };

export default function About() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">about</p>
        <h1>RaioViajante</h1>
        <p className="rv-dek">Curious enough to build it myself.</p>
      </div>
      <section className="rv-section" aria-labelledby="about-heading">
        <SectionHeading id="about-heading" number="01." title="What I do" />
        <p className="rv-copy">
          I build software, explore developer tools and write about what I learn
          along the way.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="exploring-heading">
        <SectionHeading
          id="exploring-heading"
          number="01.1"
          title="Current projects"
        />
        <p className="rv-copy">
          Right now, that includes{" "}
          {projects
            .filter((project) => project.name !== "Dump")
            .map((project) => project.name)
            .join(", ")}
          .
        </p>
      </section>
      <section className="rv-section" aria-labelledby="elsewhere-heading">
        <SectionHeading
          id="elsewhere-heading"
          number="01.2"
          title="Elsewhere"
        />
        <p className="rv-copy">
          My technical notes live at{" "}
          <a href="https://dump.raioviajante.com">dump.raioviajante.com</a>. You
          can find my code on{" "}
          <a href="https://github.com/RaioViajante">GitHub</a>.
        </p>
      </section>
    </>
  );
}
