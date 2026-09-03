import type { ReactNode } from "react";

import { PostMeta } from "@/components/PostMeta";
import type { Post } from "@/lib/posts";

interface PostArticleProps {
  post: Post;
  children: ReactNode;
}

/**
 * Chrome around a rendered MDX post: title, byline, prose body, and a slot for
 * a future comments section (Giscus). The content system does not need to
 * change when comments are added — mount them where the marker is.
 */
export function PostArticle({ post, children }: PostArticleProps) {
  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        <PostMeta date={post.date} tags={post.tags} />
      </header>

      <div className="prose">{children}</div>

      {/* Comments slot: render <Comments /> (Giscus) here later. */}
    </article>
  );
}
