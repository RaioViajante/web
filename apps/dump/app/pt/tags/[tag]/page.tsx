import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@raioviajante/design/parts";

import { DumpShell } from "@/components/DumpShell";
import { TagPostList, tagHref } from "@/components/TagViews";
import { tagCounterparts } from "@/lib/inventory";
import { getAllTags, getPostsByTagId } from "@/lib/posts";
import { dumpCopy } from "@/lib/copy";
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
    title: dumpCopy(locale).tagPageSeo.title(found.label),
    description: dumpCopy(locale).tagPageSeo.description(found.label),
  });
}

export default async function TagPagePt({ params }: PageProps) {
  const { tag } = await params;
  const found = tagFromSlug(locale, tag);
  if (!found) notFound();
  const posts = getPostsByTagId(locale, found.id);
  if (posts.length === 0) notFound();
  return (
    <DumpShell
      current="/pt/tags"
      languagePath={tagHref(found.slug, locale)}
      counterpart={tagCounterparts(locale, found.id)[0]?.path}
      locale={locale}
    >
      <PageHeader
        label={dumpCopy(locale).tags.pageLabel}
        title={found.label}
        line={dumpCopy(locale).tags.posts(posts.length)}
      />
      <TagPostList posts={posts} locale={locale} />
    </DumpShell>
  );
}
