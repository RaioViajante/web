import { getPublishedPosts } from "@/lib/posts";
import { getPostDetails } from "@/lib/post-details";

// The identity of the essay: shared contentId, Portuguese original, English
// translation. The body is checked by the parity suite.
const ID = "acho-que-nao-deveriamos-ter-conseguido-fazer-isso";
const version = (locale: "en" | "pt-BR") =>
  getPublishedPosts(locale).find((post) => post.contentId === ID)!;

describe("We Probably Shouldn't Have Been Able to Do That", () => {
  it("is a Portuguese original with an English translation, dated once", () => {
    const en = version("en");
    const pt = version("pt-BR");
    expect([pt.slug, pt.title, pt.originalLocale]).toEqual([
      "acho-que-nao-deveriamos-ter-conseguido-fazer-isso",
      "Acho que não deveríamos ter conseguido fazer isso",
      "pt-BR",
    ]);
    expect([en.slug, en.title, en.originalLocale]).toEqual([
      "we-probably-shouldnt-have-been-able-to-do-that",
      "We Probably Shouldn't Have Been Able to Do That",
      "pt-BR",
    ]);
    expect(en.publishedAt).toBe(pt.publishedAt);
    expect(en.tags).toEqual(["personal", "security"]);
    expect(pt.tags).toEqual(en.tags);
  });

  it("has no sections: the essay is a single run of short paragraphs", () => {
    expect(getPostDetails(version("en")).headings).toEqual([]);
    expect(getPostDetails(version("pt-BR")).headings).toEqual([]);
  });
});
