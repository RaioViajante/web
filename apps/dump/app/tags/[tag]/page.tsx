import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@raioviajante/design/parts";

import { DumpShell } from "@/components/DumpShell";
import { TagPostList, tagHref } from "@/components/TagViews";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { metadataFor } from "@/lib/seo";

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return metadataFor({
    path: tagHref(tag),
    title: `Posts tagged "${tag}"`,
    description: `Technical writing and project notes tagged "${tag}" on dump.`,
  });
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <DumpShell current="/tags">
      <PageHeader
        label="Tag"
        title={tag}
        line={`${posts.length} ${posts.length === 1 ? "post" : "posts"}`}
      />
      <TagPostList posts={posts} />
    </DumpShell>
  );
}
