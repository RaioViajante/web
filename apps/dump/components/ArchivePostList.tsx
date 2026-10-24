import Link from "next/link";
import { LeaderRow, Section } from "@raioviajante/design/parts";
import { DEFAULT_LOCALE, type LocaleId } from "../../../site/locales";

import { postPath } from "@/lib/inventory";
import { ptCopy } from "@/lib/pt";
import { tagPresentation } from "@/lib/tags";
import { formatPostMonth, sortPostsNewestFirst, type Post } from "@/lib/posts";

type PostMonthGroup = { month: string; name: string; posts: Post[] };
type PostYear = { year: string; months: PostMonthGroup[]; posts: Post[] };

export function formatArchiveDate(date: string): string {
  return date.slice(5);
}

export function groupPostsByYear(
  posts: readonly Post[],
  locale: LocaleId = DEFAULT_LOCALE,
): PostYear[] {
  const years = new Map<string, PostYear>();
  for (const post of sortPostsNewestFirst(posts)) {
    const year = post.publishedAt.slice(0, 4);
    const group = years.get(year) ?? { year, months: [], posts: [] };
    group.posts.push(post);
    const month = post.publishedAt.slice(5, 7);
    let monthGroup = group.months.find((item) => item.month === month);
    if (!monthGroup) {
      monthGroup = {
        month,
        name: formatPostMonth(post.publishedAt, locale),
        posts: [],
      };
      group.months.push(monthGroup);
    }
    monthGroup.posts.push(post);
    years.set(year, group);
  }
  return [...years.values()];
}

export function ArchivePostList({
  posts,
  locale = DEFAULT_LOCALE,
}: {
  posts: Post[];
  locale?: LocaleId;
}) {
  if (!posts.length)
    return (
      <p data-testid="archive-empty" className="archive-empty">
        {locale === DEFAULT_LOCALE ? "No posts yet." : ptCopy.archive.empty}
      </p>
    );
  return (
    <>
      {groupPostsByYear(posts, locale).map(({ year, months }, index) => (
        <Section
          key={year}
          number={`${String(index + 1).padStart(2, "0")}.`}
          title={year}
        >
          {months.map((month) => (
            <div className="archive-month" key={month.month}>
              <p className="rv-label">
                {month.name} · {month.posts.length}
              </p>
              <ol className="archive-post-list">
                {month.posts.map((post) => (
                  <li key={post.slug}>
                    <LeaderRow
                      label={
                        <span className="archive-label">
                          <time
                            className="archive-date"
                            dateTime={post.publishedAt}
                          >
                            {formatArchiveDate(post.publishedAt)}
                          </time>
                          <span>{post.title}</span>
                        </span>
                      }
                      value={
                        post.tags[0]
                          ? tagPresentation(post.tags[0], post.locale).label
                          : undefined
                      }
                      href={postPath(post)}
                      linkComponent={Link}
                    />
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </Section>
      ))}
    </>
  );
}
