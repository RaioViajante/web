import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "../../components/SectionHeading";

export const metadata: Metadata = { title: "this site" };

export default function ThisSite() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">this site</p>
        <h1>raioviajante.com</h1>
        <p className="rv-dek">
          A small home for my projects, writing and experiments.
        </p>
      </div>
      <section className="rv-section" aria-labelledby="site-heading">
        <SectionHeading id="site-heading" number="05." title="The site" />
        <p className="rv-copy">
          This is the starting point for the RaioViajante sites. It brings my
          projects, recent writing, artwork and contact information into one
          place. The writing lives on Dump, the documentation on Docs, and the
          experiments on Lab. Each has its own site and purpose.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="built-heading">
        <SectionHeading
          id="built-heading"
          number="05.1"
          title="How it is built"
        />
        <ul className="rv-dash-list">
          <li>Next.js, React and TypeScript for the site itself</li>
          <li>CSS for the layout, typography and visual identity</li>
          <li>Original artwork for the character and gallery</li>
          <li>
            Dump&apos;s public RSS feed for the latest writing on the index
          </li>
          <li>Optional sound, with its preference saved in your browser</li>
        </ul>
      </section>
      <section className="rv-section" aria-labelledby="repository-heading">
        <SectionHeading
          id="repository-heading"
          number="05.2"
          title="Repository"
        />
        <p className="rv-copy">
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
      </section>
    </>
  );
}
