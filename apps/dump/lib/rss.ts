import { absoluteUrl, site } from "@/lib/site";
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

function item(post: Post): string {
  const url = absoluteUrl(`/posts/${post.slug}`);
  return [
    "    <item>",
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${escapeXml(url)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
    `      <pubDate>${toRfc822(post.date)}</pubDate>`,
    `      <description>${escapeXml(post.description)}</description>`,
    ...post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
    "    </item>",
  ].join("\n");
}

/** Render an RSS 2.0 feed for the given posts (already filtered and sorted). */
export function renderRssFeed(posts: Post[]): string {
  const self = absoluteUrl("/rss.xml");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(site.name)}</title>`,
    `    <link>${escapeXml(site.url)}</link>`,
    `    <description>${escapeXml(site.description)}</description>`,
    `    <language>${escapeXml(site.locale)}</language>`,
    `    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />`,
    ...posts.map(item),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
