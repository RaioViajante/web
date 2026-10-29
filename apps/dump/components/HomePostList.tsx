import Link from "next/link";
import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import { IndexHeader, LeaderRow, Section } from "@raioviajante/design/parts";
import { identity } from "../../../seo/structured-data";
import {
  DEFAULT_LOCALE,
  localizedPath,
  type LocaleId,
} from "../../../site/locales";

import { series } from "@/lib/post-details";
import { postPath } from "@/lib/inventory";
import { dumpCopy } from "@/lib/copy";
import { tagPresentation } from "@/lib/tags";
import {
  formatPostDate,
  formatPostMonth,
  sortPostsNewestFirst,
  type Post,
} from "@/lib/posts";

interface PostMonth {
  key: string;
  name: string;
  posts: Post[];
}

/** A post's tags in its own language, as shown. */
const tagLabels = (post: Post) =>
  post.tags.map((tag) => tagPresentation(tag, post.locale).label).join(" · ");

export function groupPostsByMonth(
  posts: readonly Post[],
  locale: LocaleId = DEFAULT_LOCALE,
): PostMonth[] {
  const months = new Map<string, PostMonth>();
  for (const post of sortPostsNewestFirst(posts)) {
    const key = post.publishedAt.slice(0, 7);
    const month = months.get(key);
    if (month) month.posts.push(post);
    else
      months.set(key, {
        key,
        name: formatPostMonth(post.publishedAt, locale),
        posts: [post],
      });
  }
  return [...months.values()];
}

export function HomePostList({
  posts,
  latestMinutes,
  locale = DEFAULT_LOCALE,
}: {
  posts: Post[];
  /** Reading time of the newest post, computed by the page from its source. */
  latestMinutes?: number;
  locale?: LocaleId;
}) {
  const copy = dumpCopy(locale);
  const sorted = sortPostsNewestFirst(posts);
  const [latest, ...older] = sorted;
  if (!latest)
    return (
      <>
        <IndexHeader
          name="dump"
          line={copy.home.line}
          avatar={<AvatarCoin />}
        />
        <p className="home-empty">{copy.home.empty}</p>
      </>
    );
  const months = groupPostsByMonth(older, locale);
  // A series section lists only the parts that exist in this locale; with none
  // it is omitted and the sections after it are numbered without a gap.
  const seriesRows = series.flatMap((item) => {
    const parts = item.contentIds
      .map((contentId) => posts.find((post) => post.contentId === contentId))
      .filter((post): post is Post => Boolean(post));
    return parts.length > 0 ? [{ name: item.name, parts }] : [];
  });
  let nextSection = months.length + 1;
  const seriesNumber = seriesRows.length > 0 ? `00.${nextSection++}` : null;
  const followNumber = `00.${nextSection}`;
  return (
    <>
      <IndexHeader name="dump" line={copy.home.line} avatar={<AvatarCoin />} />
      <Section number="00." title={copy.home.latest} id="latest-heading" index>
        <Link
          className="featured-post"
          data-sound="nav"
          href={postPath(latest)}
        >
          <strong>{latest.title}</strong>
          <span>{latest.description}</span>
        </Link>
        <p className="post-meta">
          <time dateTime={latest.publishedAt}>
            {formatPostDate(latest.publishedAt, locale)}
          </time>
          <span aria-hidden="true"> · </span>
          {latestMinutes ? (
            <>
              {copy.post.minutesRead(latestMinutes)}
              <span aria-hidden="true"> · </span>
            </>
          ) : null}
          {tagLabels(latest)}
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
                  value={
                    <time dateTime={post.publishedAt}>
                      {formatPostDate(post.publishedAt, locale)}
                    </time>
                  }
                  href={postPath(post)}
                  linkComponent={Link}
                />
                <p>{post.description}</p>
                <span className="post-tags">{tagLabels(post)}</span>
              </li>
            ))}
          </ol>
        </Section>
      ))}
      {seriesNumber ? (
        <Section
          number={seriesNumber}
          title={copy.home.series}
          id="series-heading"
          index
        >
          {seriesRows.map(({ name, parts }) => (
            <LeaderRow
              key={name}
              label={name}
              value={copy.home.parts(parts.length)}
              href={postPath(parts[0]!)}
              linkComponent={Link}
            />
          ))}
        </Section>
      ) : null}
      <Section
        number={followNumber}
        title={copy.home.follow}
        id="follow-heading"
        index
      >
        <LeaderRow
          label="RSS"
          value={copy.home.feed}
          href={localizedPath("dump", locale, "/rss.xml")}
        />
        <LeaderRow
          label="GitHub"
          value={copy.home.code}
          href={identity.github}
          rel="me"
        />
      </Section>
    </>
  );
}
