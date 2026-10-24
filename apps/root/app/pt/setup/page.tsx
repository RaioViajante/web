import { headers } from "next/headers";
import {
  LeaderRow,
  PageHeader,
  Section,
} from "@raioviajante/design/components";
import { jsonLdScript } from "../../../../../seo/structured-data";
import { RootShell } from "../../../components/RootShell";
import { ptGearCategories, ptSetup } from "../../../lib/pt";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";
import { gear } from "../../../lib/setup";
import { webPageJsonLd } from "../../../lib/structured-data";

const path = routes.setup["pt-BR"]!;
export const metadata = metadataFor(path);

export default async function SetupPt() {
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
        label={ptSetup.label}
        title={ptSetup.title}
        line={ptSetup.line}
      />
      <Section number="00.1" title={ptSetup.gearTitle} id="gear-heading">
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
                    <a href={item.url} rel="sponsored">
                      {item.url.replace(/^https:\/\//, "")}
                    </a>
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
