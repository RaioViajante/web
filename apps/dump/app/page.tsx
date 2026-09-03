import { HomePostList } from "@/components/HomePostList";
import { getPublishedPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getPublishedPosts();

  return (
    <>
      <h1 className="visually-hidden">Recent posts</h1>
      <HomePostList posts={posts} />
    </>
  );
}
