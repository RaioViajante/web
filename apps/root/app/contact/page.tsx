import type { Metadata } from "next";
import { PageHeader, Quote, Section } from "@raioviajante/design/components";
import { RootShell } from "../../components/RootShell";

export const metadata: Metadata = { title: "contact" };

export default function Contact() {
  return (
    <RootShell current="/contact">
      <PageHeader
        label="contact"
        title="Let's talk"
        line="Ideas, questions, feedback or just a hello."
      />
      <Section number="03." title="Primary contact" id="contact-heading">
        <p>
          <a href="mailto:mail@raioviajante.com" data-sound="nav">
            mail@raioviajante.com
          </a>
        </p>
        <p>
          This is the best way to reach me about open source, something we could
          build together, or a question about what I&apos;ve made, written or
          documented. Corrections, feedback and a simple hello are welcome too.
        </p>
      </Section>
      <Section number="03.1" title="A good first message" id="message-heading">
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
      </Section>
      <Section number="03.2" title="An easy first step" id="first-step-heading">
        <Quote>
          A few lines of context are enough to start. No formal brief needed.
        </Quote>
      </Section>
    </RootShell>
  );
}
