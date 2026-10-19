import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { jsonLdScript } from "../../../../../../seo/structured-data";
import { PostArticle } from "@/components/PostArticle";
import { blogPostingJsonLd } from "@/lib/structured-data";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { renderPost } from "@/lib/render-post";
import { metadataFor, postSeo } from "@/lib/seo";

const locale = "pt-BR" as const;
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPostSlugs(locale).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(locale, slug);
  if (!post) return {};
  const metadata = metadataFor(postSeo(post));
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: new Date(`${post.publishedAt}T00:00:00Z`).toISOString(),
      ...(post.updatedAt
        ? {
            modifiedTime: new Date(`${post.updatedAt}T00:00:00Z`).toISOString(),
          }
        : {}),
      tags: post.tags,
    },
  };
}

export default async function PostPagePt({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(locale, slug);
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
