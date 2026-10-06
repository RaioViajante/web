import Link from "next/link";
import { LeaderRow, Section } from "@raioviajante/design/parts";

import { formatPostMonth, sortPostsNewestFirst, type Post } from "@/lib/posts";

type PostMonthGroup = { month: string; name: string; posts: Post[] };
type PostYear = { year: string; months: PostMonthGroup[]; posts: Post[] };

export function formatArchiveDate(date: string): string {
  return date.slice(5);
}

export function groupPostsByYear(posts: readonly Post[]): PostYear[] {
  const years = new Map<string, PostYear>();
  for (const post of sortPostsNewestFirst(posts)) {
    const year = post.date.slice(0, 4);
    const group = years.get(year) ?? { year, months: [], posts: [] };
    group.posts.push(post);
    const month = post.date.slice(5, 7);
    let monthGroup = group.months.find((item) => item.month === month);
    if (!monthGroup) {
      monthGroup = { month, name: formatPostMonth(post.date), posts: [] };
      group.months.push(monthGroup);
    }
    monthGroup.posts.push(post);
    years.set(year, group);
  }
  return [...years.values()];
}

export function ArchivePostList({ posts }: { posts: Post[] }) {
  if (!posts.length) return <p className="archive-empty">No posts yet.</p>;
  return (
    <>
      {groupPostsByYear(posts).map(({ year, months }, index) => (
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
                        <>
                          <time className="archive-date" dateTime={post.date}>
                            {formatArchiveDate(post.date)}
                          </time>
                          {post.title}
                        </>
                      }
                      value={post.tags[0]}
                      href={`/posts/${post.slug}`}
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
