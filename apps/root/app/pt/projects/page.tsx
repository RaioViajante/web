import { PageHeader } from "@raioviajante/design/components";
import { RootShell } from "../../../components/RootShell";
import { ProjectsBody } from "../../../components/projects/featured";
import { projectsCopyFor } from "../../../components/projects/copy";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";

const path = routes.projects["pt-BR"]!;
export const metadata = metadataFor(path);

export default function ProjectsPt() {
  const copy = projectsCopyFor("pt-BR").page;
  return (
    <RootShell current={path} locale="pt-BR">
      <PageHeader label={copy.label} title={copy.title} line={copy.line} />
      <ProjectsBody locale="pt-BR" />
    </RootShell>
  );
}
