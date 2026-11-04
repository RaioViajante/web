import { PageHeader } from "@raioviajante/design/components";
import { RootShell } from "../../components/RootShell";
import { ProjectsBody } from "../../components/projects/featured";
import { projectsCopyFor } from "../../components/projects/copy";
import { metadataFor } from "../../lib/seo";
import { routes } from "../../lib/routes";

const path = routes.projects.en!;
export const metadata = metadataFor(path);

export default function Projects() {
  const copy = projectsCopyFor("en").page;
  return (
    <RootShell current={path}>
      <PageHeader label={copy.label} title={copy.title} line={copy.line} />
      <ProjectsBody locale="en" />
    </RootShell>
  );
}
