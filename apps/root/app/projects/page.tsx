import type { Metadata } from "next";
import { projects } from "../../lib/projects";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "projects",
};

export default function Projects() {
  return (
    <>
      <h1 className={`section-label ${styles.heading}`}>projects/</h1>
      {projects.map((project) => (
        <a
          key={project.name}
          href={project.href}
          target="_blank"
          rel="noreferrer noopener"
          className={styles.project}
        >
          <h2 className={styles.name}>{project.name}</h2>
          <p className={styles.description}>{project.description}</p>
          <p className={styles.metadata}>
            {project.stack} · {project.year} · {project.status}
          </p>
        </a>
      ))}
    </>
  );
}
