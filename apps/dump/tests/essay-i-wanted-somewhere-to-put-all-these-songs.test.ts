import fs from "node:fs";
import path from "node:path";

import { getPublishedPosts, POSTS_DIRECTORY } from "@/lib/posts";
import { getPostDetails } from "@/lib/post-details";
import { publishedPostPaths } from "@/lib/published-routes.generated";

// The approved identity of the Refrain essay: shared contentId, Portuguese
// original, English translation, both published. The body is checked by the
// parity and language-annotation suites; its one English fragment, the album
// title, is pinned here because those suites would not notice it disappear.
const ID = "eu-queria-um-lugar-para-guardar-todas-essas-musicas";
const PT_SLUG = "eu-queria-um-lugar-para-guardar-todas-essas-musicas";
const EN_SLUG = "i-wanted-somewhere-to-put-all-these-songs";
const version = (locale: "en" | "pt-BR") =>
  getPublishedPosts(locale).find((post) => post.contentId === ID)!;
const englishSpans = (slug: string) =>
  [
    ...fs
      .readFileSync(path.join(POSTS_DIRECTORY, `${slug}.mdx`), "utf8")
      .matchAll(/<span lang="en">([^<>]+)<\/span>/g),
  ].map((match) => match[1]);

describe("I Wanted Somewhere to Put All These Songs", () => {
  it("is a Portuguese original with an English translation, dated once", () => {
    const en = version("en");
    const pt = version("pt-BR");
    expect([pt.slug, pt.title, pt.originalLocale]).toEqual([
      PT_SLUG,
      "Eu queria um lugar para guardar todas essas músicas",
      "pt-BR",
    ]);
    expect([en.slug, en.title, en.originalLocale]).toEqual([
      EN_SLUG,
      "I Wanted Somewhere to Put All These Songs",
      "pt-BR",
    ]);
    expect(en.description).toBe(
      "About music, the memories that get attached to songs, and how a university assignment turned into Refrain, my personal music journal.",
    );
    expect(pt.description).toBe(
      "Sobre música, as memórias que ficam presas às canções e como um trabalho da faculdade virou o Refrain, meu diário musical pessoal.",
    );
    expect(en.publishedAt).toBe("2026-11-03");
    expect(pt.publishedAt).toBe(en.publishedAt);
    expect([en.updatedAt, pt.updatedAt]).toEqual([undefined, undefined]);
    expect(en.tags).toEqual(["personal", "projects"]);
    expect(pt.tags).toEqual(en.tags);
  });

  it("is published in both languages, with a route in the manifest", () => {
    expect([version("en").draft, version("pt-BR").draft]).toEqual([
      false,
      false,
    ]);
    expect(publishedPostPaths.en).toContain(`/posts/${EN_SLUG}`);
    expect(publishedPostPaths["pt-BR"]).toContain(`/pt/posts/${PT_SLUG}`);
  });

  it("has no sections: the essay is a single run of paragraphs", () => {
    expect(getPostDetails(version("en")).headings).toEqual([]);
    expect(getPostDetails(version("pt-BR")).headings).toEqual([]);
  });

  it("marks the album title Grace as English in the Portuguese original only", () => {
    expect(englishSpans(PT_SLUG)).toEqual(["Grace"]);
    expect(englishSpans(EN_SLUG)).toEqual([]);
  });
});
