import { staticMetadata } from "@/lib/seo";
import { PageHeader } from "@raioviajante/design/parts";

import { DumpShell } from "@/components/DumpShell";
import { TagIndex } from "@/components/TagViews";
import { DEFAULT_LOCALE } from "../../../../site/locales";
import { dumpCopy } from "@/lib/copy";
import { getAllTags } from "@/lib/posts";

export const metadata = staticMetadata("/tags");

export default function TagsPage() {
  const tags = getAllTags(DEFAULT_LOCALE);
  const copy = dumpCopy(DEFAULT_LOCALE).tags;

  return (
    <DumpShell current="/tags">
      <PageHeader label={copy.label} title={copy.title} line={copy.line} />
      <TagIndex tags={tags} />
    </DumpShell>
  );
}
