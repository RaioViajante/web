import { headers } from "next/headers";
import { PageHeader } from "@raioviajante/design/components";
import { jsonLdScript } from "../../../../../../seo/structured-data";
import { RootShell } from "../../../../components/RootShell";
import {
  AllProjectsBack,
  AllProjectsBody,
} from "../../../../components/projects/catalog";
import { projectsCopyFor } from "../../../../components/projects/copy";
import { metadataFor } from "../../../../lib/seo";
import { routes } from "../../../../lib/routes";
import { webPageJsonLd } from "../../../../lib/structured-data";

const path = routes["projects-all"]["pt-BR"]!;
export const metadata = metadataFor(path);

export default async function AllProjectsPt() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const copy = projectsCopyFor("pt-BR").all;
  return (
    <RootShell current={path} locale="pt-BR">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(webPageJsonLd(path, "pt-BR")),
        }}
      />
      <AllProjectsBack locale="pt-BR" />
      <PageHeader label={copy.label} title={copy.title} line={copy.line} />
      <AllProjectsBody locale="pt-BR" />
    </RootShell>
  );
}
