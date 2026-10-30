import {
  DEFAULT_LOCALE,
  localizedPath,
  participates,
  type LocaleId,
} from "../../../site/locales";
import { siteOrigins } from "../../../site/sites";
const DUMP_ORIGIN = siteOrigins.dump;
const FEED_URL = `${DUMP_ORIGIN}/rss.xml`;

export interface RecentPost {
  title: string;
  url: string;
  date: string;
}

const fallbackPosts: RecentPost[] = [
  {
    title: "Translating the Site Without Pretending Everything Already Exists",
    url: `${DUMP_ORIGIN}/posts/translating-the-site-without-pretending-everything-already-exists`,
    date: "2026-10-19",
  },
  {
    title: "I Gave One Operation More Than One Deadline",
    url: `${DUMP_ORIGIN}/posts/gave-one-operation-more-than-one-deadline`,
    date: "2026-09-27",
  },
  {
    title: "I Kept Building and Stopped Writing It Down",
    url: `${DUMP_ORIGIN}/posts/kept-building-and-stopped-writing-it-down`,
    date: "2026-09-27",
  },
];

function decodeXml(value: string): string {
  return value.replace(
    /&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);/g,
    (entity) => {
      const named: Record<string, string> = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&apos;": "'",
      };
      if (entity in named) return named[entity];
      const codePoint = entity.startsWith("&#x")
        ? Number.parseInt(entity.slice(3, -1), 16)
        : Number.parseInt(entity.slice(2, -1), 10);
      return Number.isInteger(codePoint) &&
        codePoint >= 0 &&
        codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity;
    },
  );
}

function tag(item: string, name: string): string | null {
  const match = item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return match ? decodeXml(match[1].trim()) : null;
}

export function parseRecentPosts(
  feed: string,
  locale: LocaleId = DEFAULT_LOCALE,
): RecentPost[] {
  // A locale's feed carries that locale's posts: /posts/ in English, /pt/posts/
  // in Portuguese. Anything else is not that locale's writing.
  const postsPath = localizedPath("dump", locale, "/posts/");
  return [...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map((match): RecentPost | null => {
      const title = tag(match[1], "title");
      const link = tag(match[1], "link");
      const published = tag(match[1], "pubDate");
      if (!title || !link || !published) return null;

      try {
        const url = new URL(link);
        const date = new Date(published);
        if (
          url.origin !== DUMP_ORIGIN ||
          !url.pathname.startsWith(postsPath) ||
          Number.isNaN(date.getTime())
        ) {
          return null;
        }
        return {
          title,
          url: url.toString(),
          date: date.toISOString().slice(0, 10),
        };
      } catch {
        return null;
      }
    })
    .filter((post): post is RecentPost => post !== null)
    .slice(0, 3);
}

export async function getRecentPosts(): Promise<RecentPost[]> {
  try {
    const response = await fetch(FEED_URL, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return fallbackPosts;
    const posts = parseRecentPosts(await response.text());
    return posts.length > 0 ? posts : fallbackPosts;
  } catch {
    return fallbackPosts;
  }
}

/** Dump's feed in a locale, built from the shared registry and origins. */
export const feedUrl = (locale: LocaleId) =>
  `${DUMP_ORIGIN}${localizedPath("dump", locale, "/rss.xml")}`;

export type LatestWriting =
  | { state: "ready"; posts: RecentPost[] }
  /** Dump does not publish this locale (yet), or its feed has nothing valid: say so, never substitute English. */
  | { state: "unavailable" };

/**
 * The latest writing in a locale. English is `getRecentPosts` as before, with
 * its English fallback list. Any other locale reads Dump's feed for that
 * locale only once Dump participates in it, and otherwise (or on any failure)
 * reports `unavailable`: never English posts under another language.
 */
export async function getLatestWriting(
  locale: LocaleId,
): Promise<LatestWriting> {
  if (locale === DEFAULT_LOCALE)
    return { state: "ready", posts: await getRecentPosts() };
  if (!participates("dump", locale)) return { state: "unavailable" };
  try {
    const response = await fetch(feedUrl(locale), {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { state: "unavailable" };
    const posts = parseRecentPosts(await response.text(), locale);
    return posts.length ? { state: "ready", posts } : { state: "unavailable" };
  } catch {
    return { state: "unavailable" };
  }
}
