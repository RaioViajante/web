import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";

import { PostArticle } from "@/components/PostArticle";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { renderPost } from "@/lib/render-post";
import { metadataFor } from "@/lib/seo";
import { jsonLdScript } from "../../../../../seo/structured-data";
import { blogPostingJsonLd } from "@/lib/structured-data";

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

  const metadata = metadataFor({
    path: `/posts/${post.slug}`,
    title: post.title,
    description: post.description,
  });
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: new Date(`${post.date}T00:00:00Z`).toISOString(),
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const Content = await renderPost(slug);
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <>
      <script
        nonce={nonce}
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
