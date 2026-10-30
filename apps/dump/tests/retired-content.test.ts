/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

import sitemap from "@/app/sitemap";
import { GET as searchIndex } from "@/app/search-index.json/route";
import { GET as searchIndexPt } from "@/app/pt/search-index.json/route";
import { getAllPosts, getAllTags, getPublishedPosts } from "@/lib/posts";
import { renderRssFeed } from "@/lib/rss";
import { series } from "@/lib/post-details";
import { isPublishedDynamicPath } from "../proxy";
import { RETIRED_CONTENT_IDS } from "./retired-content-ids";

// Four works were retired by an explicit editorial decision. Each had an
// English and a Portuguese version, identified by contentId, never by title.
const RETIRED = {
  "building-orbit": {
    en: "building-orbit",
    "pt-BR": "cansei-de-crud-entao-estou-construindo-um-agendador",
  },
  "apparently-moving-a-file-has-edge-cases": {
    en: "apparently-moving-a-file-has-edge-cases",
    "pt-BR": "aparentemente-mover-um-arquivo-tem-casos-de-borda",
  },
  "an-execution-is-more-than-a-row-in-a-database": {
    en: "an-execution-is-more-than-a-row-in-a-database",
    "pt-BR": "uma-execucao-e-mais-do-que-uma-linha-no-banco-de-dados",
  },
  "a-toml-file-changed-what-sweep-was": {
    en: "a-toml-file-changed-what-sweep-was",
    "pt-BR": "um-arquivo-toml-mudou-o-que-o-sweep-era",
  },
} as const;
const IDS = Object.keys(RETIRED);

const SLUGS = Object.values(RETIRED).flatMap((s) => Object.values(s));
const PATHS = Object.values(RETIRED).flatMap((s) => [
  `/posts/${s.en}`,
  `/pt/posts/${s["pt-BR"]}`,
]);

describe("retired works", () => {
  it("targets exactly four works and eight localized versions", () => {
    expect([...RETIRED_CONTENT_IDS].sort()).toEqual([...IDS].sort());
    expect(IDS).toHaveLength(4);
    expect(SLUGS).toHaveLength(8);
    expect(new Set(SLUGS).size).toBe(8);
  });

  it("leaves nine published works, nine per language", () => {
    for (const locale of ["en", "pt-BR"] as const)
      expect(getPublishedPosts(locale)).toHaveLength(9);
  });

  it("has no source file, record or draft for any retired contentId or slug", () => {
    const posts = getAllPosts();
    for (const post of posts) {
      expect(IDS).not.toContain(post.contentId);
      expect(SLUGS).not.toContain(post.slug);
    }
    for (const slug of SLUGS)
      expect(
        fs.existsSync(path.join(process.cwd(), "content/posts", `${slug}.mdx`)),
      ).toBe(false);
  });

  it("is in no series and no tag count", () => {
    for (const item of series)
      for (const id of item.contentIds) expect(IDS).not.toContain(id);
    // Tags only the retired works used have no posts left.
    for (const locale of ["en", "pt-BR"] as const) {
      const ids = getAllTags(locale).map((tag) => tag.id);
      for (const id of [
        "java",
        "spring",
        "distributed-systems",
        "python",
        "pytest",
        "toml",
        "cli",
        "sweep",
        "automation",
      ])
        expect(ids).not.toContain(id);
    }
  });

  it("is absent from the sitemaps, search index and feeds", async () => {
    const urls = sitemap().map((entry) => new URL(entry.url).pathname);
    const entries = (await searchIndex().json()) as Array<{ href: string }>;
    const ptEntries = (await searchIndexPt().json()) as Array<{ href: string }>;
    expect(entries).toHaveLength(9);
    expect(ptEntries).toHaveLength(9);
    const hrefs = [...entries, ...ptEntries].map(
      (entry) => new URL(entry.href).pathname,
    );
    for (const locale of ["en", "pt-BR"] as const) {
      const feed = renderRssFeed(getPublishedPosts(locale), locale);
      expect(feed.match(/<item>/g)).toHaveLength(9);
      for (const slug of SLUGS) expect(feed).not.toContain(slug);
    }
    for (const retired of PATHS) {
      expect(urls).not.toContain(retired);
      expect(hrefs).not.toContain(retired);
    }
  });

  it("answers its old routes with the existing localized 404", () => {
    for (const retired of PATHS)
      expect(isPublishedDynamicPath(retired)).toBe(false);
  });
});
