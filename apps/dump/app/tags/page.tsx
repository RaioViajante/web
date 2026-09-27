import type { Metadata } from "next";

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
    <div className="tags-page">
      <h1 className="tags-heading">Tags</h1>
      <TagIndex tags={tags} />
    </div>
  );
}
