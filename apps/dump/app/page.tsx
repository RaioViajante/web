import { staticMetadata } from "@/lib/seo";

import { DumpShell } from "@/components/DumpShell";
import { HomePostList } from "@/components/HomePostList";
import { getPostDetails } from "@/lib/post-details";
import { getPublishedPosts } from "@/lib/posts";

export const metadata = staticMetadata("/");

export default function HomePage() {
  const posts = getPublishedPosts();
  const latest = posts[0];

  return (
    <DumpShell current="/">
      <HomePostList
        posts={posts}
        latestMinutes={latest ? getPostDetails(latest).minutes : undefined}
      />
    </DumpShell>
  );
}
