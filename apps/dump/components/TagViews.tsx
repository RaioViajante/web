import Link from "next/link";
import { LeaderRow, Section } from "@raioviajante/design/parts";

import { sortPostsNewestFirst, type Post, type TagCount } from "@/lib/posts";

export function tagHref(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}`;
}
export function formatTagPostDate(date: string): string {
  return date.slice(2);
}

export function TagIndex({ tags }: { tags: TagCount[] }) {
  if (!tags.length) return <p className="tags-empty">No tags yet.</p>;
  const groups = [
    {
      label: "Recurring",
      number: "02.",
      items: tags.filter((item) => item.count > 1),
    },
    {
      label: "Once so far",
      number: "02.1",
      items: tags.filter((item) => item.count === 1),
    },
  ].filter((group) => group.items.length > 0);
  return (
    <>
      {groups.map(({ label, number, items }, index) => (
        <Section
          key={label}
          number={index === 0 ? "02." : number}
          title={label}
        >
          <ol
            className={
              label === "Recurring" ? "tag-index" : "tag-index tag-index--two"
            }
          >
            {items.map(({ tag, count }) => (
              <li className="tag-index-item" key={tag}>
                <LeaderRow
                  label={tag}
                  value={count}
                  href={tagHref(tag)}
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
            value={<time dateTime={post.date}>{post.date.slice(5)}</time>}
            href={`/posts/${post.slug}`}
            linkComponent={Link}
          />
        </li>
      ))}
    </ol>
  );
}
