import { staticMetadata } from "@/lib/seo";
import { PageHeader } from "@raioviajante/design/parts";

import { ArchivePostList } from "@/components/ArchivePostList";
import { DumpShell } from "@/components/DumpShell";
import { DEFAULT_LOCALE } from "../../../../site/locales";
import { dumpCopy } from "@/lib/copy";
import {
  formatPostDate,
  getPublishedPosts,
  sortPostsNewestFirst,
} from "@/lib/posts";

export const metadata = staticMetadata("/archive");

export default function ArchivePage() {
  const posts = sortPostsNewestFirst(getPublishedPosts(DEFAULT_LOCALE));
  const first = posts[posts.length - 1];
  const copy = dumpCopy(DEFAULT_LOCALE).archive;

  return (
    <DumpShell current="/archive">
      <PageHeader
        label={copy.label}
        title={copy.title}
        line={
          first
            ? copy.since(
                posts.length,
                formatPostDate(first.publishedAt, DEFAULT_LOCALE),
              )
            : copy.emptyLine
        }
      />
      <ArchivePostList posts={posts} />
    </DumpShell>
  );
}
