import type { Metadata } from "next";
import { PageHeader } from "@raioviajante/design/parts";

import { DumpShell } from "@/components/DumpShell";
import { TagIndex } from "@/components/TagViews";
import { getAllTags } from "@/lib/posts";
import { alternatesFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse posts by topic.",
  alternates: alternatesFor("/tags"),
};

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
