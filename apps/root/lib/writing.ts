const FEED_URL = "https://dump.raioviajante.com/rss.xml";
const DUMP_ORIGIN = "https://dump.raioviajante.com";

export interface RecentPost {
  title: string;
  url: string;
  date: string;
}

const fallbackPosts: RecentPost[] = [
  {
    title: "A TOML File Changed What Sweep Was",
    url: `${DUMP_ORIGIN}/posts/a-toml-file-changed-what-sweep-was`,
    date: "2026-09-27",
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

export function parseRecentPosts(feed: string): RecentPost[] {
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
          !url.pathname.startsWith("/posts/") ||
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
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return fallbackPosts;
    const posts = parseRecentPosts(await response.text());
    return posts.length > 0 ? posts : fallbackPosts;
  } catch {
    return fallbackPosts;
  }
}
