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
import { postCounterparts, postPath, tagPath } from "@/lib/inventory";
import { formatPostDate } from "@/lib/posts";
import { dumpCopy } from "@/lib/copy";
import { routes } from "@/lib/routes";
import { tagPresentation } from "@/lib/tags";
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
  const copy = dumpCopy(post.locale).post;
  const date = (value: string) => formatPostDate(value, post.locale);
  const toc = [
    ...details.headings.map((heading) => ({
      label: heading.title,
      href: `#${heading.id}`,
      number: heading.number,
    })),
    {
      label: copy.keepReading,
      href: "#keep-reading",
      number: "02.",
    },
    {
      label: copy.comments,
      href: "#comments",
      number: "03.",
    },
  ];
  const hasRelated = details.related.length > 0 || details.lab;
  const counterpart = postCounterparts(post)[0]?.path;

  return (
    <DumpShell
      current={routes.home[post.locale]}
      languagePath={postPath(post)}
      locale={post.locale}
      counterpart={counterpart}
      toc={toc}
    >
      <div className="rv-progress" data-reading-progress aria-hidden="true" />
      <article className="post-article">
        <PageHeader
          label={`${copy.label} · ${post.tags[0] ? tagPresentation(post.tags[0], post.locale).label : "dump"}`}
          title={post.title}
          line={post.description}
          meta={[
            <time key="published" dateTime={post.publishedAt}>
              {date(post.publishedAt)}
            </time>,
            copy.minutesRead(details.minutes),
            <span key="tags" className="post-tags">
              {post.tags.map((tag) => {
                const { label, slug } = tagPresentation(tag, post.locale);
                return (
                  <Link
                    key={tag}
                    href={tagPath(post.locale, slug)}
                    data-sound="nav"
                  >
                    {label}
                  </Link>
                );
              })}
            </span>,
          ]}
        />
        <Prose>{children}</Prose>
        <div className="post-end">
          <LeaderRow
            label={copy.published}
            value={
              <time dateTime={post.publishedAt}>{date(post.publishedAt)}</time>
            }
          />
          {post.updatedAt && (
            <LeaderRow
              label={copy.updated}
              value={
                <time dateTime={post.updatedAt}>{date(post.updatedAt)}</time>
              }
            />
          )}
          <LeaderRow
            label={copy.tags}
            wrapValue
            value={
              <span className="post-tags">
                {post.tags.map((tag) => {
                  const { label, slug } = tagPresentation(tag, post.locale);
                  return (
                    <Link
                      key={tag}
                      href={tagPath(post.locale, slug)}
                      data-sound="nav"
                    >
                      {label}
                    </Link>
                  );
                })}
              </span>
            }
          />
          {details.currentSeries && (
            <LeaderRow label={copy.series} value={details.currentSeries.name} />
          )}
          <LeaderRow
            label={copy.source}
            value={copy.edit}
            href={`${REPOSITORY_EDIT_URL}/${post.slug}.mdx`}
          />
        </div>
        <Section number="02." title={copy.keepReading} id="keep-reading">
          <Pager
            locale={post.locale}
            linkComponent={Link}
            prev={
              details.previous
                ? {
                    title: details.previous.title,
                    href: postPath(details.previous),
                  }
                : undefined
            }
            next={
              details.next
                ? {
                    title: details.next.title,
                    href: postPath(details.next),
                  }
                : undefined
            }
          />
          {hasRelated && (
            <div className="post-related">
              {details.related.length > 0 && (
                <>
                  <p className="rv-label">{copy.related}</p>
                  {details.related.map((item) => (
                    <LeaderRow
                      key={item.slug}
                      label={item.title}
                      value={
                        <time dateTime={item.publishedAt}>
                          {date(item.publishedAt)}
                        </time>
                      }
                      href={postPath(item)}
                      linkComponent={Link}
                    />
                  ))}
                </>
              )}
              {details.lab && (
                <>
                  <p className="rv-label">{copy.labTry}</p>
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
        <Section number="03." title={copy.comments} id="comments">
          <p>{copy.commentsPowered}</p>
          <Comments contentId={post.contentId} locale={post.locale} />
        </Section>
      </article>
    </DumpShell>
  );
}
