import Link from "next/link";
import { series } from "@/lib/post-details";

import { formatPostMonth, sortPostsNewestFirst, type Post } from "@/lib/posts";

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
    if (month) month.posts.push(post);
    else
      months.set(key, { key, name: formatPostMonth(post.date), posts: [post] });
  }
  return [...months.values()];
}

export function HomePostList({ posts }: { posts: Post[] }) {
  const sorted = sortPostsNewestFirst(posts);
  const [latest, ...older] = sorted;
  if (!latest) return <p className="home-empty">No posts yet.</p>;
  return (
    <>
      <header className="rv-hero dump-hero">
        <p className="rv-eyebrow">Writing</p>
        <h1>dump</h1>
        <p className="rv-dek">a memory dump, hopefully readable.</p>
      </header>
      <section className="rv-section" aria-labelledby="latest-heading">
        <h2 className="rv-section-heading" id="latest-heading">
          <span className="rv-section-number">00.</span>Latest
        </h2>
        <Link className="featured-post" href={`/posts/${latest.slug}`}>
          <strong>{latest.title}</strong>
          <span>{latest.description}</span>
        </Link>
        <p className="post-meta">
          <time dateTime={latest.date}>{latest.date}</time>
          <span aria-hidden="true"> · </span>
          {latest.tags.join(" · ")}
        </p>
      </section>
      {groupPostsByMonth(older).map((month, index) => (
        <section
          className="rv-section post-month"
          key={month.key}
          aria-labelledby={`month-${month.key}`}
        >
          <h2 className="rv-section-heading" id={`month-${month.key}`}>
            <span className="rv-section-number">00.{index + 1}</span>
            {month.name} {month.key.slice(0, 4)}
          </h2>
          <ol className="month-post-list">
            {month.posts.map((post) => (
              <li className="month-post" key={post.slug}>
                <Link className="dump-leader" href={`/posts/${post.slug}`}>
                  <span>{post.title}</span>
                  <span className="dump-dots" aria-hidden="true" />
                  <time dateTime={post.date}>{post.date.slice(5)}</time>
                </Link>
                <p>{post.description}</p>
                <span className="post-tags">{post.tags.join(" · ")}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <section className="rv-section" aria-labelledby="series-heading">
        <h2 className="rv-section-heading" id="series-heading">
          <span className="rv-section-number">
            00.{groupPostsByMonth(older).length + 1}
          </span>
          Series
        </h2>
        {series.map((item) => {
          const parts = item.slugs
            .map((slug) => posts.find((post) => post.slug === slug))
            .filter((post): post is Post => Boolean(post));
          return parts.length > 0 ? (
            <div className="series-entry" key={item.name}>
              <h3>
                {item.name}{" "}
                <span>
                  · {parts.length} {parts.length === 1 ? "part" : "parts"}
                </span>
              </h3>
              {parts.map((post) => (
                <Link
                  className="dump-leader"
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                >
                  <span>{post.title}</span>
                  <span className="dump-dots" aria-hidden="true" />
                  <span>read</span>
                </Link>
              ))}
            </div>
          ) : null;
        })}
      </section>
      <section className="rv-section" aria-labelledby="follow-heading">
        <h2 className="rv-section-heading" id="follow-heading">
          <span className="rv-section-number">
            00.{groupPostsByMonth(older).length + 2}
          </span>
          Follow along
        </h2>
        <a className="dump-leader" href="/rss.xml">
          <span>RSS</span>
          <span className="dump-dots" aria-hidden="true" />
          <span>feed</span>
        </a>
        <a className="dump-leader" href="https://github.com/RaioViajante">
          <span>GitHub</span>
          <span className="dump-dots" aria-hidden="true" />
          <span>code ↗</span>
        </a>
      </section>
    </>
  );
}
