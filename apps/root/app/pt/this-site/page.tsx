import { headers } from "next/headers";
import Link from "next/link";
import { PageHeader, Section } from "@raioviajante/design/components";
import { jsonLdScript } from "../../../../../seo/structured-data";
import { RootShell } from "../../../components/RootShell";
import { ptThisSite } from "../../../lib/pt";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";
import { webPageJsonLd } from "../../../lib/structured-data";

const path = routes["this-site"]["pt-BR"]!;
export const metadata = metadataFor(path);

export default async function ThisSitePt() {
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
        label={ptThisSite.label}
        title={ptThisSite.title}
        line={ptThisSite.line}
      />
      <Section number="05." title={ptThisSite.siteTitle} id="site-heading">
        <p>{ptThisSite.site}</p>
      </Section>
      <Section number="05.1" title={ptThisSite.builtTitle} id="built-heading">
        <ul className="rv-dash-list">
          {ptThisSite.builtItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
      {ptThisSite.otherSites.map((site, index) => (
        <Section
          key={site.id}
          number={`05.${index + 2}`}
          title={site.title}
          id={`${site.id}-heading`}
        >
          <p>
            <a
              href={site.link.href}
              hrefLang={site.link.hrefLang}
              data-sound="nav"
            >
              {new URL(site.link.href).host}
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
      <Section
        number={`05.${ptThisSite.otherSites.length + 2}`}
        title={ptThisSite.repositoryTitle}
        id="repository-heading"
      >
        <p>
          {ptThisSite.repositoryBefore}
          <a href="https://github.com/RaioViajante/web" data-sound="nav">
            GitHub
          </a>
          {ptThisSite.repositoryAfter}
          <Link href={routes.terms["pt-BR"]!} data-sound="nav">
            {ptThisSite.terms}
          </Link>
          .
        </p>
      </Section>
    </RootShell>
  );
}
