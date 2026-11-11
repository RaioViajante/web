import { PageHeader } from "@raioviajante/design/components";
import { RootShell } from "../../../../components/RootShell";
import {
  AllProjectsBack,
  AllProjectsBody,
} from "../../../../components/projects/catalog";
import { projectsCopyFor } from "../../../../components/projects/copy";
import { metadataFor } from "../../../../lib/seo";
import { routes } from "../../../../lib/routes";

const path = routes["projects-all"]["pt-BR"]!;
export const metadata = metadataFor(path);

export default function AllProjectsPt() {
  const copy = projectsCopyFor("pt-BR").all;
  return (
    <RootShell current={path} locale="pt-BR">
      <AllProjectsBack locale="pt-BR" />
      <PageHeader label={copy.label} title={copy.title} line={copy.line} />
      <AllProjectsBody locale="pt-BR" />
    </RootShell>
  );
}
