import type { Metadata } from "next";

import { HomePostList } from "@/components/HomePostList";
import { getPublishedPosts } from "@/lib/posts";
import { alternatesFor } from "@/lib/site";

export const metadata: Metadata = {
  alternates: alternatesFor("/"),
};

export default function HomePage() {
  const posts = getPublishedPosts();

  return (
    <>
      <h1 className="visually-hidden">Recent posts</h1>
      <HomePostList posts={posts} />
    </>
  );
}
