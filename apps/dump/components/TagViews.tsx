import Link from "next/link";
import { LeaderRow, Section } from "@raioviajante/design/parts";
import { DEFAULT_LOCALE, type LocaleId } from "../../../site/locales";

import { postPath, tagPath } from "@/lib/inventory";
import { ptCopy } from "@/lib/pt";
import { sortPostsNewestFirst, type Post, type TagCount } from "@/lib/posts";

export function tagHref(
  slug: string,
  locale: LocaleId = DEFAULT_LOCALE,
): string {
  return tagPath(locale, slug);
}
export function formatTagPostDate(date: string): string {
  return date.slice(2);
}

export function TagIndex({
  tags,
  locale = DEFAULT_LOCALE,
}: {
  tags: TagCount[];
  locale?: LocaleId;
}) {
  if (!tags.length)
    return (
      <p className="tags-empty">
        {locale === DEFAULT_LOCALE ? "No tags yet." : ptCopy.tags.empty}
      </p>
    );
  const portuguese = locale !== DEFAULT_LOCALE;
  const groups = [
    {
      label: portuguese ? ptCopy.tags.recurring : "Recurring",
      number: "02.",
      recurring: true,
      items: tags.filter((item) => item.count > 1),
    },
    {
      label: portuguese ? ptCopy.tags.once : "Once so far",
      number: "02.1",
      recurring: false,
      items: tags.filter((item) => item.count === 1),
    },
  ].filter((group) => group.items.length > 0);
  return (
    <>
      {groups.map(({ label, number, recurring, items }, index) => (
        <Section
          key={label}
          number={index === 0 ? "02." : number}
          title={label}
        >
          <ol className={recurring ? "tag-index" : "tag-index tag-index--two"}>
            {items.map(({ id, label, slug, count }) => (
              <li className="tag-index-item" key={id}>
                <LeaderRow
                  label={label}
                  value={count}
                  href={tagHref(slug, locale)}
                  linkComponent={Link}
                />
              </li>
            ))}
          </ol>
        </Section>
      ))}
    </>
  );
}

export function TagPostList({ posts }: { posts: Post[] }) {
  return (
    <ol className="tag-post-list">
      {sortPostsNewestFirst(posts).map((post) => (
        <li key={post.slug}>
          <LeaderRow
            label={post.title}
            value={
              <time dateTime={post.publishedAt}>
                {post.publishedAt.slice(5)}
              </time>
            }
            href={postPath(post)}
            linkComponent={Link}
          />
        </li>
      ))}
    </ol>
  );
}
