import { DEFAULT_LOCALE } from "../../../site/locales";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  LeaderRow,
  PageHeader,
  Pager,
  Prose,
  Section,
} from "@raioviajante/design/parts";

import { Comments } from "@/components/Comments";
import { DumpShell } from "@/components/DumpShell";
import { getPostDetails } from "@/lib/post-details";
import type { Post } from "@/lib/posts";

const REPOSITORY_EDIT_URL =
  "https://github.com/RaioViajante/web/edit/main/apps/dump/content/posts";

export function PostArticle({
  post,
  children,
}: {
  post: Post;
  children: ReactNode;
}) {
  const details = getPostDetails(post);
  const toc = [
    ...details.headings.map((heading) => ({
      label: heading.title,
      href: `#${heading.id}`,
      number: heading.number,
    })),
    { label: "Keep reading", href: "#keep-reading", number: "02." },
    { label: "Comments", href: "#comments", number: "03." },
  ];
  const hasRelated = details.related.length > 0 || details.lab;

  return (
    <DumpShell current="/" toc={toc}>
      <div className="rv-progress" data-reading-progress aria-hidden="true" />
      <article className="post-article">
        <PageHeader
          label={`Post · ${post.tags[0] ?? "dump"}`}
          title={post.title}
          line={post.description}
          meta={[
            <time key="published" dateTime={post.publishedAt}>
              {post.publishedAt}
            </time>,
            `${details.minutes} min read`,
            <span key="tags" className="post-tags">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  data-sound="nav"
                >
                  {tag}
                </Link>
              ))}
            </span>,
          ]}
        />
        <Prose>{children}</Prose>
        <div className="post-end">
          <LeaderRow
            label="published"
            value={<time dateTime={post.publishedAt}>{post.publishedAt}</time>}
          />
          {post.updatedAt && (
            <LeaderRow
              label="updated"
              value={<time dateTime={post.updatedAt}>{post.updatedAt}</time>}
            />
          )}
          <LeaderRow
            label="tags"
            wrapValue
            value={
              <span className="post-tags">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    data-sound="nav"
                  >
                    {tag}
                  </Link>
                ))}
              </span>
            }
          />
          {details.currentSeries && (
            <LeaderRow label="series" value={details.currentSeries.name} />
          )}
          <LeaderRow
            label="source"
            value="edit on GitHub ↗"
            href={`${REPOSITORY_EDIT_URL}/${post.slug}.mdx`}
          />
        </div>
        <Section number="02." title="Keep reading" id="keep-reading">
          <Pager
            locale={DEFAULT_LOCALE}
            linkComponent={Link}
            prev={
              details.previous
                ? {
                    title: details.previous.title,
                    href: `/posts/${details.previous.slug}`,
                  }
                : undefined
            }
            next={
              details.next
                ? {
                    title: details.next.title,
                    href: `/posts/${details.next.slug}`,
                  }
                : undefined
            }
          />
          {hasRelated && (
            <div className="post-related">
              {details.related.length > 0 && (
                <>
                  <p className="rv-label">Related by tag</p>
                  {details.related.map((item) => (
                    <LeaderRow
                      key={item.slug}
                      label={item.title}
                      value={item.publishedAt.slice(5)}
                      href={`/posts/${item.slug}`}
                      linkComponent={Link}
                    />
                  ))}
                </>
              )}
              {details.lab && (
                <>
                  <p className="rv-label">Try it</p>
                  <LeaderRow
                    label={details.lab.title}
                    value="lab ↗"
                    href={details.lab.href}
                  />
                </>
              )}
            </div>
          )}
        </Section>
        <Section number="03." title="Comments" id="comments">
          <p>Powered by GitHub Discussions.</p>
          <Comments />
        </Section>
      </article>
    </DumpShell>
  );
}
