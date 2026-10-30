import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@raioviajante/design/parts";

import { DumpShell } from "@/components/DumpShell";
import { TagPostList, tagHref } from "@/components/TagViews";
import { DEFAULT_LOCALE } from "../../../../../site/locales";
import { getAllTags, getPostsByTagId } from "@/lib/posts";
import { tagFromSlug } from "@/lib/tags";
import { metadataFor } from "@/lib/seo";
import { tagCounterparts } from "@/lib/inventory";
import { dumpCopy } from "@/lib/copy";

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
  if (!found) notFound();
  return metadataFor({
    path: tagHref(found.slug),
    locale: DEFAULT_LOCALE,
    counterparts: tagCounterparts(DEFAULT_LOCALE, found.id),
    title: dumpCopy(DEFAULT_LOCALE).tagPageSeo.title(found.label),
    description: dumpCopy(DEFAULT_LOCALE).tagPageSeo.description(found.label),
  });
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const found = tagFromSlug(DEFAULT_LOCALE, tag);
  if (!found) notFound();
  const posts = getPostsByTagId(DEFAULT_LOCALE, found.id);
  if (posts.length === 0) notFound();

  return (
    <DumpShell
      current="/tags"
      languagePath={tagHref(found.slug)}
      counterpart={tagCounterparts(DEFAULT_LOCALE, found.id)[0]?.path}
    >
      <PageHeader
        label={dumpCopy(DEFAULT_LOCALE).tags.pageLabel}
        title={found.label}
        line={dumpCopy(DEFAULT_LOCALE).tags.posts(posts.length)}
      />
      <TagPostList posts={posts} />
    </DumpShell>
  );
}
