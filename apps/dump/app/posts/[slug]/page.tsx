import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PostArticle } from "@/components/PostArticle";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { alternatesFor } from "@/lib/site";
import { blogPostingJsonLd, jsonLdScript } from "@/lib/structured-data";

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: alternatesFor(`/posts/${post.slug}`),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/posts/${post.slug}`,
      publishedTime: new Date(`${post.date}T00:00:00Z`).toISOString(),
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { default: Content } = await import(`@/content/posts/${slug}.mdx`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(blogPostingJsonLd(post)),
        }}
      />
      <PostArticle post={post}>
        <Content />
      </PostArticle>
    </>
  );
}
