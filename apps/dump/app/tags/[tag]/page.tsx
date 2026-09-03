import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PostList } from "@/components/PostList";
import { getAllTags, getPostsByTag } from "@/lib/posts";

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
  const name = decodeURIComponent(tag);
  return {
    title: `Posts tagged "${name}"`,
    description: `Posts tagged "${name}".`,
    alternates: { canonical: `/tags/${tag}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  const posts = getPostsByTag(name);
  if (posts.length === 0) notFound();

  return (
    <>
      <h1>Posts tagged {name}</h1>
      <PostList posts={posts} />
    </>
  );
}
