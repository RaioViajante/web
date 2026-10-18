import { PageHeader } from "@raioviajante/design/parts";

import { ArchivePostList } from "@/components/ArchivePostList";
import { DumpShell } from "@/components/DumpShell";
import { getPublishedPosts, sortPostsNewestFirst } from "@/lib/posts";
import { ptCopy } from "@/lib/pt";
import { routes } from "@/lib/routes";
import { staticMetadata } from "@/lib/seo";

const locale = "pt-BR" as const;
const path = routes.archive[locale]!;

export const metadata = staticMetadata(path);

export default function ArchivePagePt() {
  const posts = sortPostsNewestFirst(getPublishedPosts(locale));
  const first = posts[posts.length - 1];
  return (
    <DumpShell current={path} locale={locale}>
      <PageHeader
        label={ptCopy.archive.label}
        title={ptCopy.archive.title}
        line={
          first
            ? `${posts.length} ${posts.length === 1 ? "texto" : "textos"} desde ${first.publishedAt}.`
            : ptCopy.archive.emptyLine
        }
      />
      <ArchivePostList posts={posts} locale={locale} />
    </DumpShell>
  );
}
