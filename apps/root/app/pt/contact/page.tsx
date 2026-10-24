import { headers } from "next/headers";
import { PageHeader, Quote, Section } from "@raioviajante/design/components";
import { jsonLdScript } from "../../../../../seo/structured-data";
import { RootShell } from "../../../components/RootShell";
import { ptContact } from "../../../lib/pt";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";
import { webPageJsonLd } from "../../../lib/structured-data";

const path = routes.contact["pt-BR"]!;
export const metadata = metadataFor(path);

export default async function ContactPt() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <RootShell current={path} locale="pt-BR">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(webPageJsonLd(path, "pt-BR")),
        }}
      />
      <PageHeader
        label={ptContact.label}
        title={ptContact.title}
        line={ptContact.line}
      />
      <Section number="03." title={ptContact.primaryTitle} id="contact-heading">
        <p>
          <a
            data-testid="content-link"
            href="mailto:mail@raioviajante.com"
            data-sound="nav"
          >
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
