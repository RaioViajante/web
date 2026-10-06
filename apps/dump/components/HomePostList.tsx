import Link from "next/link";
import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import { IndexHeader, LeaderRow, Section } from "@raioviajante/design/parts";

import { series } from "@/lib/post-details";
import { formatPostMonth, sortPostsNewestFirst, type Post } from "@/lib/posts";

interface PostMonth {
  key: string;
  name: string;
  posts: Post[];
}

export function groupPostsByMonth(posts: readonly Post[]): PostMonth[] {
  const months = new Map<string, PostMonth>();
  for (const post of sortPostsNewestFirst(posts)) {
    const key = post.date.slice(0, 7);
    const month = months.get(key);
    if (month) month.posts.push(post);
    else
      months.set(key, { key, name: formatPostMonth(post.date), posts: [post] });
  }
  return [...months.values()];
}

export function HomePostList({
  posts,
  latestMinutes,
}: {
  posts: Post[];
  /** Reading time of the newest post, computed by the page from its source. */
  latestMinutes?: number;
}) {
  const sorted = sortPostsNewestFirst(posts);
  const [latest, ...older] = sorted;
  if (!latest) return <p className="home-empty">No posts yet.</p>;
  const months = groupPostsByMonth(older);
  return (
    <>
      <IndexHeader
        name="dump"
        line="a memory dump, hopefully readable."
        avatar={<AvatarCoin />}
      />
      <Section number="00." title="Latest" id="latest-heading" index>
        <Link
          className="featured-post"
          data-sound="nav"
          href={`/posts/${latest.slug}`}
        >
          <strong>{latest.title}</strong>
          <span>{latest.description}</span>
        </Link>
        <p className="post-meta">
          <time dateTime={latest.date}>{latest.date}</time>
          <span aria-hidden="true"> · </span>
          {latestMinutes ? (
            <>
              {latestMinutes} min read
              <span aria-hidden="true"> · </span>
            </>
          ) : null}
          {latest.tags.join(" · ")}
        </p>
      </Section>
      {months.map((month, index) => (
        <Section
          key={month.key}
          number={`00.${index + 1}`}
          title={`${month.name} ${month.key.slice(0, 4)}`}
          id={`month-${month.key}`}
          index
        >
          <ol className="month-post-list">
            {month.posts.map((post) => (
              <li className="month-post" key={post.slug}>
                <LeaderRow
                  label={post.title}
                  value={<time dateTime={post.date}>{post.date.slice(5)}</time>}
                  href={`/posts/${post.slug}`}
                  linkComponent={Link}
                />
                <p>{post.description}</p>
                <span className="post-tags">{post.tags.join(" · ")}</span>
              </li>
            ))}
          </ol>
        </Section>
      ))}
      <Section
        number={`00.${months.length + 1}`}
        title="Series"
        id="series-heading"
        index
      >
        {series.map((item) => {
          const parts = item.slugs
            .map((slug) => posts.find((post) => post.slug === slug))
            .filter((post): post is Post => Boolean(post));
          return parts.length > 0 ? (
            <LeaderRow
              key={item.name}
              label={item.name}
              value={`${parts.length} ${parts.length === 1 ? "part" : "parts"}`}
              href={`/posts/${parts[0]!.slug}`}
              linkComponent={Link}
            />
          ) : null;
        })}
      </Section>
      <Section
        number={`00.${months.length + 2}`}
        title="Follow along"
        id="follow-heading"
        index
      >
        <LeaderRow label="RSS" value="feed" href="/rss.xml" />
        <LeaderRow
          label="GitHub"
          value="code ↗"
          href="https://github.com/RaioViajante"
        />
      </Section>
    </>
  );
}
