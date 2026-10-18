import { PageHeader } from "@raioviajante/design/parts";

import { DumpShell } from "@/components/DumpShell";
import { TagIndex } from "@/components/TagViews";
import { getAllTags } from "@/lib/posts";
import { ptCopy } from "@/lib/pt";
import { routes } from "@/lib/routes";
import { staticMetadata } from "@/lib/seo";

const locale = "pt-BR" as const;
const path = routes.tags[locale]!;

export const metadata = staticMetadata(path);

export default function TagsPagePt() {
  return (
    <DumpShell current={path} locale={locale}>
      <PageHeader
        label={ptCopy.tags.label}
        title={ptCopy.tags.title}
        line={ptCopy.tags.line}
      />
      <TagIndex tags={getAllTags(locale)} locale={locale} />
    </DumpShell>
  );
}
