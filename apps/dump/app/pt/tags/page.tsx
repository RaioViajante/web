import { PageHeader } from "@raioviajante/design/parts";

import { DumpShell } from "@/components/DumpShell";
import { TagIndex } from "@/components/TagViews";
import { getAllTags } from "@/lib/posts";
import { dumpCopy } from "@/lib/copy";
import { routes } from "@/lib/routes";
import { staticMetadata } from "@/lib/seo";

const locale = "pt-BR" as const;
const path = routes.tags[locale]!;

export const metadata = staticMetadata(path);

export default function TagsPagePt() {
  const copy = dumpCopy(locale).tags;
  return (
    <DumpShell current={path} locale={locale}>
      <PageHeader label={copy.label} title={copy.title} line={copy.line} />
      <TagIndex tags={getAllTags(locale)} locale={locale} />
    </DumpShell>
  );
}
