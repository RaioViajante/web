import type { ReactNode } from "react";

import { Comments } from "@/components/Comments";
import { PostMeta } from "@/components/PostMeta";
import type { Post } from "@/lib/posts";

interface PostArticleProps {
  post: Post;
  children: ReactNode;
}

/**
 * Chrome around a rendered MDX post: title, byline, prose body, and the
 * comments section (Giscus). `Comments` is the only client boundary here —
 * everything else in this tree stays server-rendered.
 */
export function PostArticle({ post, children }: PostArticleProps) {
  return (
    <article className="post-article">
      <header>
        <h1 className="post-title">{post.title}</h1>
        <PostMeta date={post.date} tags={post.tags} />
        <p className="post-dek">{post.description}</p>
      </header>

      <div className="prose">{children}</div>

      <Comments />
    </article>
  );
}
