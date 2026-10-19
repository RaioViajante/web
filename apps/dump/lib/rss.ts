import {
  DEFAULT_LOCALE,
  LOCALES,
  localizedPath,
  type LocaleId,
} from "../../../site/locales";
import { absoluteUrl, site } from "@/lib/site";
import { ptPageSeo } from "@/lib/pt";
import { rssGuid } from "@/lib/rss-identity";
import type { Post } from "@/lib/posts";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

/** A locale's feed path: `/rss.xml` for English, `/pt/rss.xml` for Portuguese. */
export function rssPath(locale: LocaleId = DEFAULT_LOCALE): string {
  return localizedPath("dump", locale, "/rss.xml");
}

/** Channel text per locale. English is the site constants, unchanged. */
function channelText(locale: LocaleId) {
  if (locale === DEFAULT_LOCALE)
    return {
      title: site.name,
      link: site.url,
      description: site.description,
    };
  return {
    title: site.name,
    link: absoluteUrl(localizedPath("dump", locale, "/")),
    description: ptPageSeo.home!.description,
  };
}

function item(post: Post): string {
  const url = absoluteUrl(
    localizedPath("dump", post.locale, `/posts/${post.slug}`),
  );
  const guid = rssGuid(post);
  return [
    "    <item>",
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${escapeXml(url)}</link>`,
    `      <guid isPermaLink="${guid === url}">${escapeXml(guid)}</guid>`,
    `      <pubDate>${toRfc822(post.publishedAt)}</pubDate>`,
    `      <description>${escapeXml(post.description)}</description>`,
    ...post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
    "    </item>",
  ].join("\n");
}

/**
 * Render one locale's RSS 2.0 feed from its published posts (already filtered
 * and sorted). A post of another locale is a caller bug and throws: feeds
 * never mix languages.
 */
export function renderRssFeed(
  posts: readonly Post[],
  locale: LocaleId = DEFAULT_LOCALE,
): string {
  const foreign = posts.find((post) => post.locale !== locale);
  if (foreign)
    throw new RangeError(
      `Cannot put "${foreign.slug}" (${foreign.locale}) in the ${locale} feed`,
    );
  const channel = channelText(locale);
  const self = absoluteUrl(rssPath(locale));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(channel.title)}</title>`,
    `    <link>${escapeXml(channel.link)}</link>`,
    `    <description>${escapeXml(channel.description)}</description>`,
    `    <language>${escapeXml(LOCALES[locale].rssLanguage)}</language>`,
    `    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />`,
    ...posts.map(item),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
