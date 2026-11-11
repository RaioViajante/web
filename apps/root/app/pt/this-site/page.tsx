import Link from "next/link";
import { PageHeader, Section } from "@raioviajante/design/components";
import { OtherSites } from "../../../components/OtherSites";
import { RootShell } from "../../../components/RootShell";
import { ptAbout, ptThisSite } from "../../../lib/pt";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";

const path = routes["this-site"]["pt-BR"]!;
export const metadata = metadataFor(path);

export default function ThisSitePt() {
  return (
    <RootShell current={path} locale="pt-BR">
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
      <OtherSites
        sites={ptThisSite.otherSites}
        englishNote={ptAbout.englishNote}
      />
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
