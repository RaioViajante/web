import Link from "next/link";

import { PostList } from "@/components/PostList";
import { getPublishedPosts } from "@/lib/posts";
import { site } from "@/lib/site";

const RECENT_COUNT = 10;

export default function HomePage() {
  const posts = getPublishedPosts();
  const recent = posts.slice(0, RECENT_COUNT);

  return (
    <>
      <h1>{site.name}</h1>
      <p>{site.description}</p>

      <h2>Recent</h2>
      <PostList posts={recent} emptyMessage="No posts yet." />

      {posts.length > RECENT_COUNT && (
        <p>
          <Link href="/archive">Full archive</Link>
        </p>
      )}
    </>
  );
}
