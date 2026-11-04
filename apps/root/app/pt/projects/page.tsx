import { headers } from "next/headers";
import { PageHeader } from "@raioviajante/design/components";
import { jsonLdScript } from "../../../../../seo/structured-data";
import { RootShell } from "../../../components/RootShell";
import { ProjectsBody } from "../../../components/projects/featured";
import { projectsCopyFor } from "../../../components/projects/copy";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";
import { webPageJsonLd } from "../../../lib/structured-data";

const path = routes.projects["pt-BR"]!;
export const metadata = metadataFor(path);

export default async function ProjectsPt() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const copy = projectsCopyFor("pt-BR").page;
  return (
    <RootShell current={path} locale="pt-BR">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(webPageJsonLd(path, "pt-BR")),
        }}
      />
      <PageHeader label={copy.label} title={copy.title} line={copy.line} />
      <ProjectsBody locale="pt-BR" />
    </RootShell>
  );
}
