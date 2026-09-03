import Link from "next/link";
import type { Metadata } from "next";

import { PostMeta } from "@/components/PostMeta";
import { getPublishedPosts, type Post } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Archive",
  description: "Every post, newest first.",
};

function groupByYear(posts: Post[]): [string, Post[]][] {
  const years = new Map<string, Post[]>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return [...years.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export default function ArchivePage() {
  const posts = getPublishedPosts();

  return (
    <>
      <h1>Archive</h1>
      {posts.length === 0 && <p>No posts yet.</p>}

      {groupByYear(posts).map(([year, yearPosts]) => (
        <section key={year}>
          <h2>{year}</h2>
          <ul className="post-list">
            {yearPosts.map((post) => (
              <li key={post.slug}>
                <h3>
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </h3>
                <PostMeta date={post.date} tags={post.tags} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
