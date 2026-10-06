import type { Metadata } from "next";
import { PageHeader } from "@raioviajante/design/parts";

import { ArchivePostList } from "@/components/ArchivePostList";
import { DumpShell } from "@/components/DumpShell";
import { getPublishedPosts, sortPostsNewestFirst } from "@/lib/posts";
import { alternatesFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every post, newest first.",
  alternates: alternatesFor("/archive"),
};

export default function ArchivePage() {
  const posts = sortPostsNewestFirst(getPublishedPosts());
  const first = posts[posts.length - 1];

  return (
    <DumpShell current="/archive">
      <PageHeader
        label="Archive"
        title="Everything"
        line={
          first
            ? `${posts.length} ${posts.length === 1 ? "post" : "posts"} since ${first.date}.`
            : "Every post, newest first."
        }
      />
      <ArchivePostList posts={posts} />
    </DumpShell>
  );
}
