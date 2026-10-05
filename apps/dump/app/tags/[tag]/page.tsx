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
      <header className="tags-page-header">
        <p className="page-kicker">Tag</p>
        <h1 className="tag-page-heading">{tag}</h1>
        <p className="page-intro">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </header>
      <TagPostList posts={posts} />
    </div>
  );
}
