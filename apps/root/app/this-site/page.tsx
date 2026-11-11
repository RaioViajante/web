import { metadataFor } from "../../lib/seo";
import Link from "next/link";
import { PageHeader, Section } from "@raioviajante/design/components";
import { siteOrigins } from "../../../../site/sites";
import { RootShell } from "../../components/RootShell";

export const metadata = metadataFor("/this-site");

/** Dump, Docs and Lab: what each holds and what sets it apart. */
const otherSites = [
  {
    id: "dump",
    number: "05.2",
    title: "Dump",
    holds: "holds my writing, in English and Portuguese.",
    built: [
      "Next.js, React and TypeScript, like this site",
      "Posts written as MDX files in the repository",
      "An archive, tags and an RSS feed in each language",
      "Comments through giscus, which keeps them in GitHub Discussions",
    ],
  },
  {
    id: "docs",
    number: "05.3",
    title: "Docs",
    holds: "holds the technical documentation for my projects.",
    built: [
      "Astro, rendering the shared components to static pages",
      "Pages written from each project's source code, not from its README",
      "Each page says what is implemented, partial or planned",
    ],
  },
  {
    id: "lab",
    number: "05.4",
    title: "Lab",
    holds: "holds interactive experiments and technical curiosities.",
    built: [
      "Astro, with small TypeScript scripts for each experiment",
      "Each experiment names the project and revision it comes from, or says it was written for the Lab as a teaching model",
      "A label says whether it runs in your browser, is simulated, or is source only",
    ],
  },
] as const;

export default function ThisSite() {
  return (
    <RootShell current="/this-site">
      <PageHeader
        label="this site"
        title="raioviajante.com"
        line="A small home for my projects, writing and experiments."
      />
      <Section number="05." title="The site" id="site-heading">
        <p>
          This is the starting point for the RaioViajante sites. It brings my
          projects, recent writing, artwork and contact information into one
          place. The writing lives on Dump, the documentation on Docs, and the
          experiments on Lab. Each has its own site and purpose, and all four
          share one design, one typeface and the same optional sound.
        </p>
      </Section>
      <Section number="05.1" title="How it is built" id="built-heading">
        <ul className="rv-dash-list">
          <li>Next.js, React and TypeScript for the site itself</li>
          <li>CSS for the layout, typography and visual identity</li>
          <li>Original artwork for the character and gallery</li>
          <li>
            Dump&apos;s public RSS feed for the latest writing on the index
          </li>
          <li>Optional sound, with its preference saved in your browser</li>
        </ul>
      </Section>
      {otherSites.map((site) => (
        <Section
          key={site.id}
          number={site.number}
          title={site.title}
          id={`${site.id}-heading`}
        >
          <p>
            <a href={siteOrigins[site.id]} data-sound="nav">
              {new URL(siteOrigins[site.id]).host}
            </a>{" "}
            {site.holds}
          </p>
          <ul className="rv-dash-list">
            {site.built.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      ))}
      <Section number="05.5" title="Repository" id="repository-heading">
        <p>
          The code for this site and the other RaioViajante web apps is on{" "}
          <a href="https://github.com/RaioViajante/web" data-sound="nav">
            GitHub
          </a>
          . For information about using the site&apos;s text or artwork, see the{" "}
          <Link href="/terms" data-sound="nav">
            Terms of Use
          </Link>
          .
        </p>
      </Section>
    </RootShell>
  );
}
