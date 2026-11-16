import { RootShell } from "../../../../components/RootShell";
import { QuadraCase } from "../../../../components/projects/case-quadra";
import { metadataFor } from "../../../../lib/seo";
import { routes } from "../../../../lib/routes";

const path = routes["projects-quadra"]["pt-BR"]!;
export const metadata = metadataFor(path);

export default function QuadraCasePagePt() {
  return (
    <RootShell current={path} locale="pt-BR">
      <QuadraCase locale="pt-BR" />
    </RootShell>
  );
}
