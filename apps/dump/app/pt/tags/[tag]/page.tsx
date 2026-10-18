import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@raioviajante/design/parts";

import { DumpShell } from "@/components/DumpShell";
import { TagPostList, tagHref } from "@/components/TagViews";
import { tagCounterparts } from "@/lib/inventory";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { ptCopy } from "@/lib/pt";
import { metadataFor } from "@/lib/seo";
import { tagFromSlug } from "@/lib/tags";

const locale = "pt-BR" as const;
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTags(locale).map(({ slug }) => ({ tag: slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const found = tagFromSlug(locale, tag);
  const label = found?.label ?? tag;
  return metadataFor({
    path: tagHref(tag, locale),
    locale,
    counterparts: found ? tagCounterparts(locale, found.id) : [],
    title: `Textos com a tag "${label}"`,
    description: `Textos técnicos e notas de projeto com a tag "${label}" no dump.`,
  });
}

export default async function TagPagePt({ params }: PageProps) {
  const { tag } = await params;
  const posts = getPostsByTag(locale, tag);
  if (posts.length === 0) notFound();
  const label = tagFromSlug(locale, tag)?.label ?? tag;
  return (
    <DumpShell current="/pt/tags" locale={locale}>
      <PageHeader
        label={ptCopy.tags.pageLabel}
        title={label}
        line={`${posts.length} ${posts.length === 1 ? ptCopy.tags.post : ptCopy.tags.posts}`}
      />
      <TagPostList posts={posts} />
    </DumpShell>
  );
}
