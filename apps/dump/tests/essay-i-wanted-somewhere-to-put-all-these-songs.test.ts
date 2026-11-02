/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { parseFrontmatter, slugFromFilename } from "@/lib/content-schema";
import { getAllPosts, POSTS_DIRECTORY } from "@/lib/posts";
import { publishedPostPaths } from "@/lib/published-routes.generated";
import { taxonomy } from "@/lib/tags";

// The Refrain essay is an undated editorial draft: a Portuguese original and
// its English translation, both awaiting the author's approval. Its truthful
// first-publication date is not known, so it lives in `content/drafts/`
// (content/README.md, "Drafts"), which the site never loads. These checks keep
// the draft ready for promotion without letting it reach any public inventory.
const ID = "eu-queria-um-lugar-para-guardar-todas-essas-musicas";
const PT_SLUG = "eu-queria-um-lugar-para-guardar-todas-essas-musicas";
const EN_SLUG = "i-wanted-somewhere-to-put-all-these-songs";
const DRAFTS = path.join(process.cwd(), "content", "drafts");
const file = { "pt-BR": `pt-BR/${PT_SLUG}.mdx`, en: `en/${EN_SLUG}.mdx` };

const read = (locale: "en" | "pt-BR") => {
  const relative = file[locale];
  const parsed = matter(fs.readFileSync(path.join(DRAFTS, relative), "utf8"));
  return {
    slug: slugFromFilename(path.basename(relative)),
    data: parsed.data as Record<string, unknown>,
    body: parsed.content,
  };
};
const blocks = (body: string) =>
  body.split(/\n\s*\n/).filter((block) => block.trim());

describe("I Wanted Somewhere to Put All These Songs (draft)", () => {
  it("is a Portuguese original with an English translation", () => {
    const pt = read("pt-BR");
    const en = read("en");
    expect([pt.slug, pt.data.title, pt.data.locale]).toEqual([
      PT_SLUG,
      "Eu queria um lugar para guardar todas essas músicas",
      "pt-BR",
    ]);
    expect([en.slug, en.data.title, en.data.locale]).toEqual([
      EN_SLUG,
      "I Wanted Somewhere to Put All These Songs",
      "en",
    ]);
    for (const version of [pt, en]) {
      expect(version.data.contentId).toBe(ID);
      expect(version.data.originalLocale).toBe("pt-BR");
      expect(version.data.draft).toBe(true);
    }
    expect(en.data.tags).toEqual(["personal", "projects"]);
    expect(pt.data.tags).toEqual(en.data.tags);
  });

  it("records no publication or update date until one is approved", () => {
    for (const locale of ["en", "pt-BR"] as const) {
      expect(read(locale).data).not.toHaveProperty("publishedAt");
      expect(read(locale).data).not.toHaveProperty("updatedAt");
    }
  });

  it("passes the post schema once a date is supplied, with tags in both locales", () => {
    // A schema probe only: this date is never written to the content. It
    // shows that adding the approved `publishedAt` is the one change left.
    const probe = "2000-01-01";
    for (const locale of ["en", "pt-BR"] as const) {
      const { slug, data } = read(locale);
      const parsed = parseFrontmatter({ ...data, publishedAt: probe }, slug);
      for (const tag of parsed.tags)
        expect(taxonomy.presentation(tag, locale)).toBeDefined();
    }
  });

  it("stays outside every published route and the post collection", () => {
    expect(getAllPosts().map((post) => post.contentId)).not.toContain(ID);
    expect(fs.existsSync(path.join(POSTS_DIRECTORY, `${PT_SLUG}.mdx`))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(POSTS_DIRECTORY, `${EN_SLUG}.mdx`))).toBe(
      false,
    );
    expect(publishedPostPaths.en).not.toContain(`/posts/${EN_SLUG}`);
    expect(publishedPostPaths["pt-BR"]).not.toContain(`/pt/posts/${PT_SLUG}`);
  });

  it("keeps the translation's shape: no sections, links or code, same paragraphs", () => {
    const pt = read("pt-BR").body;
    const en = read("en").body;
    for (const body of [pt, en]) {
      expect(body).not.toMatch(/^#{1,6} /m);
      expect(body).not.toMatch(/\]\(|`/);
    }
    expect(blocks(en)).toHaveLength(blocks(pt).length);
  });

  it("marks English only in the Portuguese original, around the album title", () => {
    expect(
      [...read("pt-BR").body.matchAll(/<span lang="en">([^<>]+)<\/span>/g)].map(
        (match) => match[1],
      ),
    ).toEqual(["Grace"]);
    expect(read("en").body).not.toMatch(/<span/);
  });
});
