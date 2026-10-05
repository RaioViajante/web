import type { Metadata } from "next";
import { SectionHeading } from "../../components/SectionHeading";

export const metadata: Metadata = { title: "contact" };

export default function Contact() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">contact</p>
        <h1>Let&apos;s talk</h1>
        <p className="rv-dek">Ideas, questions, feedback or just a hello.</p>
      </div>
      <section className="rv-section" aria-labelledby="contact-heading">
        <SectionHeading
          id="contact-heading"
          number="03."
          title="Primary contact"
        />
        <p className="rv-copy">
          <a href="mailto:mail@raioviajante.com" data-sound="nav">
            mail@raioviajante.com
          </a>
        </p>
        <p className="rv-copy">
          This is the best way to reach me about open source, something we could
          build together, or a question about what I&apos;ve made, written or
          documented. Corrections, feedback and a simple hello are welcome too.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="message-heading">
        <SectionHeading
          id="message-heading"
          number="03.1"
          title="A good first message"
        />
        <ul className="rv-dash-list">
          <li>What you have in mind</li>
          <li>
            A relevant project, post or documentation link, if there is one
          </li>
          <li>
            What kind of conversation or collaboration you are looking for
          </li>
          <li>Any timing that matters</li>
        </ul>
      </section>
      <section className="rv-section" aria-labelledby="first-step-heading">
        <SectionHeading
          id="first-step-heading"
          number="03.2"
          title="An easy first step"
        />
        <blockquote className="rv-callout">
          A few lines of context are enough to start. No formal brief needed.
        </blockquote>
      </section>
    </>
  );
}
