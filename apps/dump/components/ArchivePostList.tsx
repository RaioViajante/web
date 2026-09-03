import Link from "next/link";

import { formatPostDate, sortPostsNewestFirst, type Post } from "@/lib/posts";

interface ArchivePostListProps {
  posts: Post[];
}

interface PostYear {
  year: string;
  posts: Post[];
}

const archiveDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  timeZone: "UTC",
});

export function formatArchiveDate(date: string): string {
  return archiveDateFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function groupPostsByYear(posts: readonly Post[]): PostYear[] {
  const years = new Map<string, Post[]>();

  for (const post of sortPostsNewestFirst(posts)) {
    const year = post.date.slice(0, 4);
    const yearPosts = years.get(year);

    if (yearPosts) {
      yearPosts.push(post);
    } else {
      years.set(year, [post]);
    }
  }

  return [...years].map(([year, yearPosts]) => ({ year, posts: yearPosts }));
}

export function ArchivePostList({ posts }: ArchivePostListProps) {
  if (posts.length === 0) {
    return <p className="archive-empty">No posts yet.</p>;
  }

  return (
    <div className="archive-years">
      {groupPostsByYear(posts).map(({ year, posts: yearPosts }) => (
        <section className="archive-year" key={year}>
          <h2 className="archive-year-heading">{year}</h2>
          <ol className="archive-post-list">
            {yearPosts.map((post) => (
              <li className="archive-post" key={post.slug}>
                <time
                  className="archive-post-date"
                  dateTime={post.date}
                  aria-label={formatPostDate(post.date)}
                >
                  {formatArchiveDate(post.date)}
                </time>
                <Link
                  className="archive-post-title"
                  href={`/posts/${post.slug}`}
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
