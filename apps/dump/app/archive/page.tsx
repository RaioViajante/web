import type { Metadata } from "next";

import { ArchivePostList } from "@/components/ArchivePostList";
import { getPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every post, newest first.",
};

export default function ArchivePage() {
  const posts = getPublishedPosts();

  return (
    <div className="archive">
      <h1 className="archive-heading">Archive</h1>
      <ArchivePostList posts={posts} />
    </div>
  );
}
