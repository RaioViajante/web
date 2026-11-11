import { RootShell } from "../../../../components/RootShell";
import { StuccoCase } from "../../../../components/projects/case-stucco";
import { metadataFor } from "../../../../lib/seo";
import { routes } from "../../../../lib/routes";

const path = routes["projects-stucco"]["pt-BR"]!;
export const metadata = metadataFor(path);

export default function StuccoCasePagePt() {
  return (
    <RootShell current={path} locale="pt-BR">
      <StuccoCase locale="pt-BR" />
    </RootShell>
  );
}
