import { staticMetadata } from "@/lib/seo";
import { PageHeader } from "@raioviajante/design/parts";

import { ArchivePostList } from "@/components/ArchivePostList";
import { DumpShell } from "@/components/DumpShell";
import { DEFAULT_LOCALE } from "../../../../site/locales";
import { getPublishedPosts, sortPostsNewestFirst } from "@/lib/posts";

export const metadata = staticMetadata("/archive");

export default function ArchivePage() {
  const posts = sortPostsNewestFirst(getPublishedPosts(DEFAULT_LOCALE));
  const first = posts[posts.length - 1];

  return (
    <DumpShell current="/archive">
      <PageHeader
        label="Archive"
        title="Everything"
        line={
          first
            ? `${posts.length} ${posts.length === 1 ? "post" : "posts"} since ${first.publishedAt}.`
            : "Every post, newest first."
        }
      />
      <ArchivePostList posts={posts} />
    </DumpShell>
  );
}
