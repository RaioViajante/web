import { RootShell } from "../../../components/RootShell";
import { QuadraCase } from "../../../components/projects/case-quadra";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";

const path = routes["projects-quadra"].en!;
export const metadata = metadataFor(path);

export default function QuadraCasePage() {
  return (
    <RootShell current={path}>
      <QuadraCase locale="en" />
    </RootShell>
  );
}
