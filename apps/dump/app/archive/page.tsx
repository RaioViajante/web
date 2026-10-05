import type { Metadata } from "next";

import { ArchivePostList } from "@/components/ArchivePostList";
import { getPublishedPosts } from "@/lib/posts";
import { alternatesFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every post, newest first.",
  alternates: alternatesFor("/archive"),
};

export default function ArchivePage() {
  const posts = getPublishedPosts();

  return (
    <div className="archive">
      <header className="archive-page-header">
        <p className="page-kicker">Writing</p>
        <h1 className="archive-heading">Archive</h1>
        <p className="page-intro">Every post, newest first.</p>
      </header>
      <ArchivePostList posts={posts} />
    </div>
  );
}
