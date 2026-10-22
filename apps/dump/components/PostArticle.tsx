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
import { postCounterparts, postPath, tagPath } from "@/lib/inventory";
import { formatPostDate } from "@/lib/posts";
import { ptCopy } from "@/lib/pt";
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
  const portuguese = post.locale !== DEFAULT_LOCALE;
  const copy = ptCopy.post;
  const toc = [
    ...details.headings.map((heading) => ({
      label: heading.title,
      href: `#${heading.id}`,
      number: heading.number,
    })),
    {
      label: portuguese ? copy.keepReading : "Keep reading",
      href: "#keep-reading",
      number: "02.",
    },
    {
      label: portuguese ? copy.comments : "Comments",
      href: "#comments",
      number: "03.",
    },
  ];
  const hasRelated = details.related.length > 0 || details.lab;
  const counterpart = postCounterparts(post)[0]?.path;

  return (
    <DumpShell
      current={post.locale === DEFAULT_LOCALE ? "/" : "/pt"}
      languagePath={postPath(post)}
      locale={post.locale}
      counterpart={counterpart}
      toc={toc}
    >
      <div className="rv-progress" data-reading-progress aria-hidden="true" />
      <article className="post-article">
        <PageHeader
          label={`${portuguese ? copy.label : "Post"} · ${post.tags[0] ? tagPresentation(post.tags[0], post.locale).label : "dump"}`}
          title={post.title}
          line={post.description}
          meta={[
            <time key="published" dateTime={post.publishedAt}>
              {portuguese
                ? formatPostDate(post.publishedAt, post.locale)
                : post.publishedAt}
            </time>,
            `${details.minutes} ${portuguese ? copy.minute : "min read"}`,
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
            label={portuguese ? copy.published : "published"}
            value={
              <time dateTime={post.publishedAt}>
                {portuguese
                  ? formatPostDate(post.publishedAt, post.locale)
                  : post.publishedAt}
              </time>
            }
          />
          {post.updatedAt && (
            <LeaderRow
              label={portuguese ? copy.updated : "updated"}
              value={
                <time dateTime={post.updatedAt}>
                  {portuguese
                    ? formatPostDate(post.updatedAt, post.locale)
                    : post.updatedAt}
                </time>
              }
            />
          )}
          <LeaderRow
            label={portuguese ? copy.tags : "tags"}
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
            <LeaderRow
              label={portuguese ? copy.series : "series"}
              value={details.currentSeries.name}
            />
          )}
          <LeaderRow
            label={portuguese ? copy.source : "source"}
            value={portuguese ? copy.edit : "edit on GitHub ↗"}
            href={`${REPOSITORY_EDIT_URL}/${post.slug}.mdx`}
          />
        </div>
        <Section
          number="02."
          title={portuguese ? copy.keepReading : "Keep reading"}
          id="keep-reading"
        >
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
                  <p className="rv-label">
                    {portuguese ? copy.related : "Related by tag"}
                  </p>
                  {details.related.map((item) => (
                    <LeaderRow
                      key={item.slug}
                      label={item.title}
                      value={item.publishedAt.slice(5)}
                      href={postPath(item)}
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
        <Section
          number="03."
          title={portuguese ? copy.comments : "Comments"}
          id="comments"
        >
          <p>
            {portuguese
              ? "Com tecnologia do GitHub Discussions."
              : "Powered by GitHub Discussions."}
          </p>
          <Comments contentId={post.contentId} locale={post.locale} />
        </Section>
      </article>
    </DumpShell>
  );
}
