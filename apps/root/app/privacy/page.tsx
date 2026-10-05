import type { Metadata } from "next";
import { SectionHeading } from "../../components/SectionHeading";

export const metadata: Metadata = { title: "privacy policy" };

export default function Privacy() {
  return (
    <>
      <div className="rv-hero">
        <p className="rv-eyebrow">legal</p>
        <h1>Privacy Policy</h1>
        <p className="rv-dek">How raioviajante.com handles information.</p>
      </div>
      <section className="rv-section" aria-labelledby="controller-heading">
        <SectionHeading
          id="controller-heading"
          number="07."
          title="Controller and contact"
        />
        <p className="rv-copy">
          This website is operated under CNPJ 53.021.377/0001-93. For questions
          about your data, write to{" "}
          <a href="mailto:mail@raioviajante.com">mail@raioviajante.com</a>.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="data-heading">
        <SectionHeading
          id="data-heading"
          number="07.1"
          title="Data and preferences"
        />
        <p className="rv-copy">
          This site has no registration form. If you email the address above, we
          receive the information you choose to send, such as your name, email
          address and message.
        </p>
        <p className="rv-copy">
          The sound switch stores your on or off preference in this browser. The
          home page requests the public RSS feed from dump.raioviajante.com on
          the server to display recent posts.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="links-heading">
        <SectionHeading id="links-heading" number="07.2" title="Other sites" />
        <p className="rv-copy">
          Links to dump, docs, lab, GitHub and other destinations open separate
          websites. Their data practices may differ from this root site.
        </p>
      </section>
      <section className="rv-section" aria-labelledby="rights-heading">
        <SectionHeading id="rights-heading" number="07.3" title="Your rights" />
        <p className="rv-copy">
          You can contact us to ask about personal information provided by
          email, or to request access, correction or deletion where applicable.
          The Brazilian data protection authority explains the rights available
          under the LGPD in its{" "}
          <a href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares">
            guide for data subjects
          </a>
          .
        </p>
      </section>
      <section className="rv-section" aria-labelledby="updates-heading">
        <SectionHeading id="updates-heading" number="07.4" title="Updates" />
        <p className="rv-copy">
          This page will be updated when the site&apos;s data practices change.
        </p>
        <p className="rv-copy">Last updated: October 4, 2026.</p>
      </section>
    </>
  );
}
