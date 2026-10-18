import Link from "next/link";
import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import { IndexHeader, LeaderRow, Section } from "@raioviajante/design/parts";
import { identity } from "../../../seo/structured-data";
import { DEFAULT_LOCALE, type LocaleId } from "../../../site/locales";

import { series } from "@/lib/post-details";
import { postPath } from "@/lib/inventory";
import { ptCopy } from "@/lib/pt";
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
  const sorted = sortPostsNewestFirst(posts);
  const [latest, ...older] = sorted;
  if (!latest)
    return (
      <>
        <IndexHeader
          name="dump"
          line={
            locale === DEFAULT_LOCALE
              ? "a memory dump, hopefully readable."
              : ptCopy.home.line
          }
          avatar={<AvatarCoin />}
        />
        <p className="home-empty">
          {locale === DEFAULT_LOCALE ? "No posts yet." : ptCopy.home.empty}
        </p>
      </>
    );
  const months = groupPostsByMonth(older, locale);
  const portuguese = locale !== DEFAULT_LOCALE;
  return (
    <>
      <IndexHeader
        name="dump"
        line={
          portuguese ? ptCopy.home.line : "a memory dump, hopefully readable."
        }
        avatar={<AvatarCoin />}
      />
      <Section
        number="00."
        title={portuguese ? ptCopy.home.latest : "Latest"}
        id="latest-heading"
        index
      >
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
            {portuguese
              ? formatPostDate(latest.publishedAt, locale)
              : latest.publishedAt}
          </time>
          <span aria-hidden="true"> · </span>
          {latestMinutes ? (
            <>
              {latestMinutes} {portuguese ? ptCopy.post.minute : "min read"}
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
                      {portuguese
                        ? formatPostDate(post.publishedAt, locale)
                        : post.publishedAt.slice(5)}
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
      <Section
        number={`00.${months.length + 1}`}
        title={portuguese ? ptCopy.home.series : "Series"}
        id="series-heading"
        index
      >
        {series.map((item) => {
          const parts = item.contentIds
            .map((contentId) =>
              posts.find((post) => post.contentId === contentId),
            )
            .filter((post): post is Post => Boolean(post));
          return parts.length > 0 ? (
            <LeaderRow
              key={item.name}
              label={item.name}
              value={`${parts.length} ${parts.length === 1 ? "part" : "parts"}`}
              href={postPath(parts[0]!)}
              linkComponent={Link}
            />
          ) : null;
        })}
      </Section>
      <Section
        number={`00.${months.length + 2}`}
        title={portuguese ? ptCopy.home.follow : "Follow along"}
        id="follow-heading"
        index
      >
        {!portuguese && <LeaderRow label="RSS" value="feed" href="/rss.xml" />}
        <LeaderRow
          label="GitHub"
          value={portuguese ? ptCopy.home.code : "code ↗"}
          href={identity.github}
          rel="me"
        />
      </Section>
    </>
  );
}
