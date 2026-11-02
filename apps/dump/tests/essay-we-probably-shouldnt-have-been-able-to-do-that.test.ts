import { getAllPosts, getPublishedPosts } from "@/lib/posts";
import { getPostDetails } from "@/lib/post-details";
import { publishedPostPaths } from "@/lib/published-routes.generated";

// The identity of the essay: shared contentId, Portuguese original, English
// translation. Both versions are drafts until the author approves the text
// and the disclosure, so neither may reach a public route. The body is
// checked by the parity suite.
const ID = "acho-que-nao-deveriamos-ter-conseguido-fazer-isso";
const PT_SLUG = "acho-que-nao-deveriamos-ter-conseguido-fazer-isso";
const EN_SLUG = "we-probably-shouldnt-have-been-able-to-do-that";
const version = (locale: "en" | "pt-BR") =>
  getAllPosts().find(
    (post) => post.contentId === ID && post.locale === locale,
  )!;

describe("We Probably Shouldn't Have Been Able to Do That", () => {
  it("is a Portuguese original with an English translation, dated once", () => {
    const en = version("en");
    const pt = version("pt-BR");
    expect([pt.slug, pt.title, pt.originalLocale]).toEqual([
      PT_SLUG,
      "Acho que não deveríamos ter conseguido fazer isso",
      "pt-BR",
    ]);
    expect([en.slug, en.title, en.originalLocale]).toEqual([
      EN_SLUG,
      "We Probably Shouldn't Have Been Able to Do That",
      "pt-BR",
    ]);
    expect(en.publishedAt).toBe(pt.publishedAt);
    expect(en.tags).toEqual(["personal", "security"]);
    expect(pt.tags).toEqual(en.tags);
  });

  it("stays a draft in both languages, outside every published route", () => {
    expect([version("en").draft, version("pt-BR").draft]).toEqual([true, true]);
    for (const locale of ["en", "pt-BR"] as const)
      expect(
        getPublishedPosts(locale).map((post) => post.contentId),
      ).not.toContain(ID);
    expect(publishedPostPaths.en).not.toContain(`/posts/${EN_SLUG}`);
    expect(publishedPostPaths["pt-BR"]).not.toContain(`/pt/posts/${PT_SLUG}`);
  });

  it("has no sections: the essay is a single run of short paragraphs", () => {
    expect(getPostDetails(version("en")).headings).toEqual([]);
    expect(getPostDetails(version("pt-BR")).headings).toEqual([]);
  });
});
