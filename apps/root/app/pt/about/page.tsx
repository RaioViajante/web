import { headers } from "next/headers";
import { PageHeader, Section } from "@raioviajante/design/components";
import { jsonLdScript } from "../../../../../seo/structured-data";
import { RootShell } from "../../../components/RootShell";
import { ptAbout } from "../../../lib/pt";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";
import { webPageJsonLd } from "../../../lib/structured-data";
import "../../about/about.css";

const path = routes.about["pt-BR"]!;
export const metadata = metadataFor(path);

/** An English-only destination: named as such, with its language declared. */
function English({ href, name }: { href: string; name: string }) {
  return (
    <>
      <a href={href} hrefLang="en" data-sound="nav">
        {name}
      </a>
      {ptAbout.englishNote}
    </>
  );
}

export default async function AboutPt() {
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
        label={ptAbout.label}
        title={ptAbout.title}
        line={ptAbout.line}
      />
      <Section number="01." title={ptAbout.whoTitle} id="about-heading">
        <p>{ptAbout.who}</p>
      </Section>
      <Section
        number="01.1"
        title={ptAbout.snapshotTitle}
        id="snapshot-heading"
      >
        <dl className="about-snapshot">
          {ptAbout.snapshot.map(({ label, value }) => (
            <div className="about-snapshot__item" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section number="01.2" title={ptAbout.whyTitle} id="building-heading">
        <p>{ptAbout.why}</p>
      </Section>
      <Section
        number="01.3"
        title={ptAbout.siteTitle}
        id="raioviajante-heading"
      >
        <p>
          {ptAbout.siteBefore}
          <English href="https://dump.raioviajante.com" name="Dump" />
          {ptAbout.siteMiddle1}
          <English href="https://docs.raioviajante.com" name="Docs" />
          {ptAbout.siteMiddle2}
          <English href="https://lab.raioviajante.com" name="Lab" />.
        </p>
      </Section>
      <Section number="01.4" title={ptAbout.outsideTitle} id="outside-heading">
        <p>{ptAbout.outside}</p>
      </Section>
    </RootShell>
  );
}
