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
      <header className="tags-page-header">
        <p className="page-kicker">Writing</p>
        <h1 className="tags-heading">Tags</h1>
        <p className="page-intro">
          Browse the recurring ideas and one-off notes.
        </p>
      </header>
      <TagIndex tags={tags} />
    </div>
  );
}
