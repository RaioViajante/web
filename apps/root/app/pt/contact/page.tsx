import { PageHeader, Quote, Section } from "@raioviajante/design/components";
import { RootShell } from "../../../components/RootShell";
import { ptContact } from "../../../lib/pt";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";

const path = routes.contact["pt-BR"]!;
export const metadata = metadataFor(path);

export default function ContactPt() {
  return (
    <RootShell current={path} locale="pt-BR">
      <PageHeader
        label={ptContact.label}
        title={ptContact.title}
        line={ptContact.line}
      />
      <Section number="03." title={ptContact.primaryTitle} id="contact-heading">
        <p>
          <a href="mailto:mail@raioviajante.com" data-sound="nav">
            mail@raioviajante.com
          </a>
        </p>
        <p>{ptContact.primary}</p>
      </Section>
      <Section
        number="03.1"
        title={ptContact.messageTitle}
        id="message-heading"
      >
        <ul className="rv-dash-list">
          {ptContact.messageItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
      <Section
        number="03.2"
        title={ptContact.firstStepTitle}
        id="first-step-heading"
      >
        <Quote>{ptContact.firstStep}</Quote>
      </Section>
    </RootShell>
  );
}
