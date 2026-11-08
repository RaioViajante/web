import { headers } from "next/headers";
import { jsonLdScript } from "../../../../../../seo/structured-data";
import { RootShell } from "../../../../components/RootShell";
import { StuccoCase } from "../../../../components/projects/case-stucco";
import { metadataFor } from "../../../../lib/seo";
import { routes } from "../../../../lib/routes";
import { webPageJsonLd } from "../../../../lib/structured-data";

const path = routes["projects-stucco"]["pt-BR"]!;
export const metadata = metadataFor(path);

export default async function StuccoCasePagePt() {
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
      <StuccoCase locale="pt-BR" />
    </RootShell>
  );
}
