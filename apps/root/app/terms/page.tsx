import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "../../components/SectionHeading";

export const metadata: Metadata = { title: "terms of use" };

export default function Terms() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">legal</p>
        <h1>Terms of Use</h1>
        <p className="rv-dek">
          A few clear notes about using raioviajante.com.
        </p>
      </div>
      <section className="rv-section" aria-labelledby="scope-heading">
        <SectionHeading id="scope-heading" number="06." title="Scope" />
        <p className="rv-copy">
          These terms describe the use of raioviajante.com, a personal site that
          presents projects, writing and links to other destinations. The site
          does not offer accounts or purchases.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="use-heading">
        <SectionHeading id="use-heading" number="06.1" title="Using the site" />
        <p className="rv-copy">
          You are welcome to read and share links to the public pages. Please do
          not interfere with the site, attempt unauthorized access or use it in
          ways that harm others.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="content-heading">
        <SectionHeading
          id="content-heading"
          number="06.2"
          title="Content and code"
        />
        <p className="rv-copy">
          Project descriptions and other content may change as the work evolves.
          Some projects link to public source repositories. Check the license in
          each repository before reusing its code; a public link alone does not
          describe reuse permissions for the site&apos;s text or artwork.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="external-heading">
        <SectionHeading
          id="external-heading"
          number="06.3"
          title="External destinations"
        />
        <p className="rv-copy">
          Dump, docs, lab, GitHub and other linked destinations are separate
          websites. Review their own information when you visit them. Our{" "}
          <Link href="/privacy">Privacy Policy</Link> describes data handling on
          this root site.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="contact-heading">
        <SectionHeading
          id="contact-heading"
          number="06.4"
          title="Contact and updates"
        />
        <p className="rv-copy">
          Questions about this site or these terms can be sent to{" "}
          <a href="mailto:mail@raioviajante.com">mail@raioviajante.com</a>. The
          current version of these terms will remain available on this page when
          updated.
        </p>
        <p className="rv-copy">Last updated: October 4, 2026.</p>
      </section>
    </>
  );
}
