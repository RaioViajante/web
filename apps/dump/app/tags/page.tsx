import { staticMetadata } from "@/lib/seo";
import { PageHeader } from "@raioviajante/design/parts";

import { DumpShell } from "@/components/DumpShell";
import { TagIndex } from "@/components/TagViews";
import { getAllTags } from "@/lib/posts";

export const metadata = staticMetadata("/tags");

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <DumpShell current="/tags">
      <PageHeader
        label="Tags"
        title="Topics"
        line="What keeps showing up, sorted by how often."
      />
      <TagIndex tags={tags} />
    </DumpShell>
  );
}
