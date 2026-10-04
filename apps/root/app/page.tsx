import Image from "next/image";
import Link from "next/link";
import { LeaderRow } from "../components/LeaderRow";
import { SectionHeading } from "../components/SectionHeading";
import { introduction } from "../lib/home";
import { primaryLinks } from "../lib/links";
import { projects } from "../lib/projects";
import { getRecentPosts } from "../lib/writing";

export const revalidate = 900;

export default async function Home() {
  const posts = await getRecentPosts();

  return (
    <>
      <div className="rv-hero">
        <Image
          src="/avatar.png"
          alt="Illustrated RaioViajante character"
          width={108}
          height={108}
          className="home-avatar"
          priority
        />
        <p className="rv-eyebrow">index</p>
        <h1>RaioViajante</h1>
        <p className="rv-dek">curious enough to build it myself.</p>
        <p className="home-intro">{introduction}</p>
      </div>

      <section className="rv-section" aria-labelledby="links-heading">
        <SectionHeading id="links-heading" number="00." title="Primary links" />
        {primaryLinks.map((link) => (
          <LeaderRow
            key={link.href}
            name={<a href={link.href}>{link.label}</a>}
            note={link.category}
          />
        ))}
      </section>

      <section className="rv-section" aria-labelledby="projects-heading">
        <SectionHeading id="projects-heading" number="00.1" title="Projects" />
        {projects
          .filter((project) => project.name !== "dump")
          .map((project) => (
            <LeaderRow
              key={project.name}
              name={<a href={project.href}>{project.name}</a>}
              note={project.status}
            />
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
