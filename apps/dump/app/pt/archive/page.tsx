import { PageHeader } from "@raioviajante/design/parts";

import { ArchivePostList } from "@/components/ArchivePostList";
import { DumpShell } from "@/components/DumpShell";
import { dumpCopy } from "@/lib/copy";
import {
  formatPostDate,
  getPublishedPosts,
  sortPostsNewestFirst,
} from "@/lib/posts";
import { routes } from "@/lib/routes";
import { staticMetadata } from "@/lib/seo";

const locale = "pt-BR" as const;
const path = routes.archive[locale]!;

export const metadata = staticMetadata(path);

export default function ArchivePagePt() {
  const posts = sortPostsNewestFirst(getPublishedPosts(locale));
  const first = posts[posts.length - 1];
  const copy = dumpCopy(locale).archive;
  return (
    <DumpShell current={path} locale={locale}>
      <PageHeader
        label={copy.label}
        title={copy.title}
        line={
          first
            ? copy.since(
                posts.length,
                formatPostDate(first.publishedAt, locale),
              )
            : copy.emptyLine
        }
      />
      <ArchivePostList posts={posts} locale={locale} />
    </DumpShell>
  );
}
