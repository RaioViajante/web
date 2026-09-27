import Link from "next/link";

import {
  formatPostMonth,
  formatPostDate,
  sortPostsNewestFirst,
  type Post,
} from "@/lib/posts";

interface HomePostListProps {
  posts: Post[];
}

interface PostMonth {
  key: string;
  name: string;
  posts: Post[];
}

export function groupPostsByMonth(posts: readonly Post[]): PostMonth[] {
  const months = new Map<string, PostMonth>();

  for (const post of sortPostsNewestFirst(posts)) {
    const key = post.date.slice(0, 7);
    const month = months.get(key);

    if (month) {
      month.posts.push(post);
    } else {
      months.set(key, {
        key,
        name: formatPostMonth(post.date),
        posts: [post],
      });
    }
  }

  return [...months.values()];
}

export function HomePostList({ posts }: HomePostListProps) {
  if (posts.length === 0) {
    return <p className="home-empty">No posts yet.</p>;
  }

  return (
    <div className="home-posts">
      {groupPostsByMonth(posts).map((month) => (
        <section className="post-month" key={month.key}>
          <h2 className="post-month-heading">
            <span>{month.key.replace("-", ".")}</span>
            <em>{month.name}</em>
          </h2>

          <ol className="month-post-list">
            {month.posts.map((post) => (
              <li className="month-post" key={post.slug}>
                <time
                  className="month-post-day"
                  dateTime={post.date}
                  aria-label={formatPostDate(post.date)}
                >
                  {post.date.slice(8, 10)}
                </time>
                <div>
                  <h3 className="month-post-title">
                    <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="month-post-description">{post.description}</p>
                  {post.tags.length > 0 && (
                    <p className="month-post-tags">
                      {post.tags.map((tag, index) => (
                        <span key={tag}>
                          {index > 0 && " · "}
                          <Link href={`/tags/${encodeURIComponent(tag)}`}>
                            {tag}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
