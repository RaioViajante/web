import { PageHeader } from "@raioviajante/design/components";
import { RootShell } from "../../../components/RootShell";
import {
  AllProjectsBack,
  AllProjectsBody,
} from "../../../components/projects/catalog";
import { projectsCopyFor } from "../../../components/projects/copy";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";

const path = routes["projects-all"].en!;
export const metadata = metadataFor(path);

export default function AllProjects() {
  const copy = projectsCopyFor("en").all;
  return (
    <RootShell current={path}>
      <AllProjectsBack locale="en" />
      <PageHeader label={copy.label} title={copy.title} line={copy.line} />
      <AllProjectsBody locale="en" />
    </RootShell>
  );
}
