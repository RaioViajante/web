import Link from "next/link";
import { AvatarCoin } from "../components/AvatarCoin";
import { ProjectPreviewRow } from "../components/ProjectPreviewRow";
import { PreviewRow } from "../components/PreviewRow";
import { LeaderRow } from "../components/LeaderRow";
import { SectionHeading } from "../components/SectionHeading";
import { primaryLinks } from "../lib/links";
import { projects } from "../lib/projects";
import { getRecentPosts } from "../lib/writing";

export const revalidate = 60;

export default async function Home() {
  const posts = await getRecentPosts();

  return (
    <>
      <div className="rv-hero">
        <AvatarCoin />
        <h1>RaioViajante</h1>
        <p className="rv-dek">curious enough to build it myself.</p>
      </div>

      <section className="rv-section" aria-labelledby="links-heading">
        <SectionHeading id="links-heading" number="00." title="Primary links" />
        {primaryLinks.map((link) => (
          <PreviewRow
            key={link.href}
            id={`primary-link-${link.category}`}
            label={link.label}
            href={link.href}
            note={link.category}
            description={link.description}
          />
        ))}
      </section>

      <section className="rv-section" aria-labelledby="projects-heading">
        <SectionHeading id="projects-heading" number="00.1" title="Projects" />
        {projects
          .filter((project) => project.name !== "Dump")
          .map((project) => (
            <ProjectPreviewRow key={project.name} project={project} />
          ))}
      </section>

      <section className="rv-section" aria-labelledby="writing-heading">
        <SectionHeading
          id="writing-heading"
          number="00.2"
          title="Latest writing"
        />
        {posts.map((post) => (
          <LeaderRow
            key={post.url}
            name={<a href={post.url}>{post.title}</a>}
            note={post.date}
          />
        ))}
        <p className="home-feed-note">from dump.raioviajante.com</p>
      </section>

      <section className="rv-section" aria-labelledby="other-links-heading">
        <SectionHeading
          id="other-links-heading"
          number="00.3"
          title="Other links"
        />
        <LeaderRow name={<Link href="/setup">Setup</Link>} note="gear" />
      </section>
    </>
  );
}
