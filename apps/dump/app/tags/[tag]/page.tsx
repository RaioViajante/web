import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { TagPostList, tagHref } from "@/components/TagViews";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { alternatesFor } from "@/lib/site";

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
  return {
    title: `Posts tagged "${tag}"`,
    description: `Posts tagged "${tag}".`,
    alternates: alternatesFor(tagHref(tag)),
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <div className="tag-page">
      <h1 className="tag-page-heading">tag: {tag}</h1>
      <TagPostList posts={posts} />
    </div>
  );
}
