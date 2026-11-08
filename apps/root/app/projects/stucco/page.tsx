import { RootShell } from "../../../components/RootShell";
import { StuccoCase } from "../../../components/projects/case-stucco";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";

const path = routes["projects-stucco"].en!;
export const metadata = metadataFor(path);

export default function StuccoCasePage() {
  return (
    <RootShell current={path}>
      <StuccoCase locale="en" />
    </RootShell>
  );
}
