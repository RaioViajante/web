import Link from "next/link";

import { PostMeta } from "@/components/PostMeta";
import type { Post } from "@/lib/posts";

interface PostListProps {
  posts: Post[];
  /** Shown when there are no posts, e.g. an empty tag or a fresh site. */
  emptyMessage?: string;
}

export function PostList({
  posts,
  emptyMessage = "Nothing here yet.",
}: PostListProps) {
  if (posts.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.slug}>
          <h2>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </h2>
          <PostMeta date={post.date} tags={post.tags} />
          <p>{post.description}</p>
        </li>
      ))}
    </ul>
  );
}
