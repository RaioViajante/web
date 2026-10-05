import Link from "next/link";
import { sortPostsNewestFirst, type Post } from "@/lib/posts";

type PostYear = { year: string; posts: Post[] };

export function formatArchiveDate(date: string): string {
  return date.slice(5);
}
export function groupPostsByYear(posts: readonly Post[]): PostYear[] {
  const years = new Map<string, Post[]>();
  for (const post of sortPostsNewestFirst(posts)) {
    const year = post.date.slice(0, 4);
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return [...years].map(([year, yearPosts]) => ({ year, posts: yearPosts }));
}

export function ArchivePostList({ posts }: { posts: Post[] }) {
  if (!posts.length) return <p className="archive-empty">No posts yet.</p>;
  return (
    <div>
      {groupPostsByYear(posts).map(({ year, posts: yearPosts }, index) => (
        <section className="rv-section" key={year}>
          <h2 className="rv-section-heading">
            <span className="rv-section-number">
              {String(index + 1).padStart(2, "0")}.
            </span>
            {year}
          </h2>
          <ol className="archive-post-list">
            {yearPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  className="dump-leader"
                  data-sound="nav"
                  href={`/posts/${post.slug}`}
                >
                  <span>{post.title}</span>
                  <span className="dump-dots" aria-hidden="true" />
                  <time dateTime={post.date}>
                    {formatArchiveDate(post.date)}
                  </time>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
