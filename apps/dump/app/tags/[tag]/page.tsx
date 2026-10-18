import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@raioviajante/design/parts";

import { DumpShell } from "@/components/DumpShell";
import { TagPostList, tagHref } from "@/components/TagViews";
import { DEFAULT_LOCALE } from "../../../../../site/locales";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { tagFromSlug } from "@/lib/tags";
import { metadataFor } from "@/lib/seo";
import { tagCounterparts } from "@/lib/inventory";

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTags(DEFAULT_LOCALE).map(({ slug }) => ({ tag: slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const found = tagFromSlug(DEFAULT_LOCALE, tag);
  const label = found?.label ?? tag;
  return metadataFor({
    path: tagHref(tag),
    locale: DEFAULT_LOCALE,
    counterparts: found ? tagCounterparts(DEFAULT_LOCALE, found.id) : [],
    title: `Posts tagged "${label}"`,
    description: `Technical writing and project notes tagged "${label}" on dump.`,
  });
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const posts = getPostsByTag(DEFAULT_LOCALE, tag);
  if (posts.length === 0) notFound();
  const label = tagFromSlug(DEFAULT_LOCALE, tag)?.label ?? tag;

  return (
    <DumpShell current="/tags">
      <PageHeader
        label="Tag"
        title={label}
        line={`${posts.length} ${posts.length === 1 ? "post" : "posts"}`}
      />
      <TagPostList posts={posts} />
    </DumpShell>
  );
}
