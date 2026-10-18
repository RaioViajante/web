import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@raioviajante/design/parts";

import { DumpShell } from "@/components/DumpShell";
import { TagPostList, tagHref } from "@/components/TagViews";
import { tagCounterparts } from "@/lib/inventory";
import { getAllTags, getPostsByTagId } from "@/lib/posts";
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
  if (!found) notFound();
  return metadataFor({
    path: tagHref(found.slug, locale),
    locale,
    counterparts: tagCounterparts(locale, found.id),
    title: `Textos com a tag "${found.label}"`,
    description: `Textos técnicos e notas de projeto com a tag "${found.label}" no dump.`,
  });
}

export default async function TagPagePt({ params }: PageProps) {
  const { tag } = await params;
  const found = tagFromSlug(locale, tag);
  if (!found) notFound();
  const posts = getPostsByTagId(locale, found.id);
  if (posts.length === 0) notFound();
  return (
    <DumpShell current="/pt/tags" locale={locale}>
      <PageHeader
        label={ptCopy.tags.pageLabel}
        title={found.label}
        line={`${posts.length} ${posts.length === 1 ? ptCopy.tags.post : ptCopy.tags.posts}`}
      />
      <TagPostList posts={posts} />
    </DumpShell>
  );
}
