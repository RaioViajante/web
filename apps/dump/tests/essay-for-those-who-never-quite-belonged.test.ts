import { getPublishedPosts } from "@/lib/posts";
import { getPostDetails } from "@/lib/post-details";

// The approved identity of the essay: shared contentId, English original,
// reviewed Portuguese translation. The body is checked by the parity suite.
const ID = "for-those-who-never-quite-belonged";
const version = (locale: "en" | "pt-BR") =>
  getPublishedPosts(locale).find((post) => post.contentId === ID)!;

describe("For Those Who Never Quite Belonged", () => {
  it("is an English original with a Portuguese translation, dated once", () => {
    const en = version("en");
    const pt = version("pt-BR");
    expect([en.slug, en.title, en.originalLocale]).toEqual([
      "for-those-who-never-quite-belonged",
      "For Those Who Never Quite Belonged",
      "en",
    ]);
    expect([pt.slug, pt.title, pt.originalLocale]).toEqual([
      "para-aqueles-que-nunca-se-sentiram-pertencentes",
      "Para Aqueles Que Nunca Se Sentiram Pertencentes",
      "en",
    ]);
    expect(en.description).toBe(
      "About a few songs, a guitar, and how strange it is to grow into someone you don't quite recognize yet.",
    );
    expect(pt.description).toBe(
      "Sobre algumas músicas, um violão e como é estranho crescer até virar alguém que você ainda não reconhece muito bem.",
    );
    expect(pt.publishedAt).toBe(en.publishedAt);
    expect(en.tags).toEqual(pt.tags);
  });

  it("has no sections: the essay is a single run of short paragraphs", () => {
    expect(getPostDetails(version("en")).headings).toEqual([]);
    expect(getPostDetails(version("pt-BR")).headings).toEqual([]);
  });
});
