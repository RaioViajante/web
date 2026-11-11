import {
  LeaderRow,
  PageHeader,
  Section,
  SiteLink,
} from "@raioviajante/design/components";
import { RootShell } from "../../../components/RootShell";
import { ptGearCategories, ptSetup } from "../../../lib/pt";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";
import { gear } from "../../../lib/setup";

const path = routes.setup["pt-BR"]!;
export const metadata = metadataFor(path);

export default function SetupPt() {
  return (
    <RootShell current={path} locale="pt-BR">
      <PageHeader
        label={ptSetup.label}
        title={ptSetup.title}
        line={ptSetup.line}
      />
      <Section number="00.1" title={ptSetup.gearTitle} id="gear-heading">
        {gear.some((item) => item.url) && (
          <p className="setup-disclosure" id="affiliate-disclosure">
            {ptSetup.disclosure}
          </p>
        )}
        {gear.length === 0 ? (
          <p className="setup-empty">{ptSetup.empty}</p>
        ) : (
          gear.map((item) => (
            <div className="setup-gear" key={item.name}>
              <LeaderRow
                label={item.name}
                value={ptGearCategories[item.category] ?? item.category}
              />
              <p className="setup-gear__link">
                {item.url ? (
                  <>
                    <strong>{ptSetup.link}</strong>{" "}
                    <SiteLink href={item.url} rel="sponsored" newTab="pt-BR">
                      {item.url.replace(/^https:\/\//, "")}
                    </SiteLink>
                  </>
                ) : (
                  ptSetup.noLink
                )}
              </p>
            </div>
          ))
        )}
      </Section>
    </RootShell>
  );
}
