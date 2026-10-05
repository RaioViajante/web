import type { Metadata } from "next";
import { SectionHeading } from "../../components/SectionHeading";

export const metadata: Metadata = { title: "contact" };

export default function Contact() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">contact</p>
        <h1>Get in touch</h1>
        <p className="rv-dek">
          A direct line for questions, ideas and projects.
        </p>
      </div>
      <section className="rv-section" aria-labelledby="contact-heading">
        <SectionHeading id="contact-heading" number="03." title="Email" />
        <p className="rv-copy">
          <a href="mailto:mail@raioviajante.com">mail@raioviajante.com</a>
        </p>
      </section>
    </>
  );
}
