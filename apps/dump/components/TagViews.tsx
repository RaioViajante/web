import Link from "next/link";

import {
  formatPostDate,
  sortPostsNewestFirst,
  type Post,
  type TagCount,
} from "@/lib/posts";

interface TagIndexProps {
  tags: TagCount[];
}

interface TagPostListProps {
  posts: Post[];
}

const tagPostDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "2-digit",
  timeZone: "UTC",
});

export function tagHref(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}`;
}

export function formatTagPostDate(date: string): string {
  const formatted = tagPostDateFormatter.format(new Date(`${date}T00:00:00Z`));
  const [monthDay, year] = formatted.split(", ");
  return `${monthDay} '${year}`;
}

export function TagIndex({ tags }: TagIndexProps) {
  if (tags.length === 0) {
    return <p className="tags-empty">No tags yet.</p>;
  }

  return (
    <ol className="tag-index">
      {tags.map(({ tag, count }) => (
        <li className="tag-index-item" key={tag}>
          <Link className="tag-index-link" href={tagHref(tag)}>
            <span className="tag-index-name">{tag}</span>
            <span className="tag-index-leader" aria-hidden="true" />
            <span className="tag-index-count">{count}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function TagPostList({ posts }: TagPostListProps) {
  return (
    <ol className="tag-post-list">
      {sortPostsNewestFirst(posts).map((post) => (
        <li className="tag-post" key={post.slug}>
          <time
            className="tag-post-date"
            dateTime={post.date}
            aria-label={formatPostDate(post.date)}
          >
            {formatTagPostDate(post.date)}
          </time>
          <Link className="tag-post-title" href={`/posts/${post.slug}`}>
            {post.title}
          </Link>
        </li>
      ))}
    </ol>
  );
}
