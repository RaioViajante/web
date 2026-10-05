import Link from "next/link";
import type { ReactNode } from "react";

import { CodeCopy } from "@/components/CodeCopy";
import { Comments } from "@/components/Comments";
import { PostMeta } from "@/components/PostMeta";
import { ReadingProgress } from "@/components/ReadingProgress";
import { PostToc } from "@/components/PostToc";
import { getPostDetails } from "@/lib/post-details";
import type { Post } from "@/lib/posts";

export function PostArticle({
  post,
  children,
}: {
  post: Post;
  children: ReactNode;
}) {
  const details = getPostDetails(post);
  return (
    <article className="post-article">
      <ReadingProgress />
      <header className="post-header">
        <p className="rv-eyebrow">
          Writing / {details.currentSeries?.name ?? "post"}
        </p>
        <h1 className="post-title">{post.title}</h1>
        <p className="post-dek">{post.description}</p>
        <PostMeta date={post.date} tags={post.tags} />
        <p className="post-meta">{details.minutes} min read</p>
      </header>
      <PostToc headings={details.headings} />
      <div className="prose">{children}</div>
      <CodeCopy />
      <div className="post-end">
        <section className="rv-section">
          <h2 className="rv-section-heading">
            <span className="rv-section-number">01.</span>Filed under
          </h2>
          <div className="dump-leader">
            <span>published</span>
            <span className="dump-dots" aria-hidden="true" />
            <time dateTime={post.date}>{post.date}</time>
          </div>
          <div className="dump-leader">
            <span>reading time</span>
            <span className="dump-dots" aria-hidden="true" />
            <span>{details.minutes} min</span>
          </div>
          <div className="dump-leader">
            <span>tags</span>
            <span className="dump-dots" aria-hidden="true" />
            <span>
              {post.tags.map((tag, index) => (
                <span key={tag}>
                  {index > 0 && " · "}
                  <Link href={`/tags/${tag}`}>{tag}</Link>
                </span>
              ))}
            </span>
          </div>
          {details.currentSeries && (
            <div className="dump-leader">
              <span>series</span>
              <span className="dump-dots" aria-hidden="true" />
              <span>{details.currentSeries.name}</span>
            </div>
          )}
        </section>
        {(details.related.length > 0 || details.lab) && (
          <section className="rv-section">
            <h2 className="rv-section-heading">
              <span className="rv-section-number">02.</span>Related
            </h2>
            {details.related.map((item) => (
              <Link
                className="dump-leader"
                key={item.slug}
                href={`/posts/${item.slug}`}
              >
                <span>{item.title}</span>
                <span className="dump-dots" aria-hidden="true" />
                <span>dump</span>
              </Link>
            ))}
            {details.lab && (
              <a className="dump-leader" href={details.lab.href}>
                <span>Try it: {details.lab.title}</span>
                <span className="dump-dots" aria-hidden="true" />
                <span>lab ↗</span>
              </a>
            )}
          </section>
        )}
        <nav className="post-neighbors" aria-label="Adjacent posts">
          <div>
            {details.previous && (
              <>
                <span>Previous</span>
                <Link href={`/posts/${details.previous.slug}`}>
                  {details.previous.title}
                </Link>
              </>
            )}
          </div>
          <div>
            {details.next && (
              <>
                <span>Next</span>
                <Link href={`/posts/${details.next.slug}`}>
                  {details.next.title}
                </Link>
              </>
            )}
          </div>
        </nav>
        <section className="rv-section">
          <h2 className="rv-section-heading">
            <span className="rv-section-number">03.</span>Comments
          </h2>
          <p className="page-intro">Powered by GitHub Discussions.</p>
          <Comments />
        </section>
      </div>
    </article>
  );
}
