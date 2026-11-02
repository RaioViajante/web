import { getPublishedPosts } from "@/lib/posts";
import { getPostDetails } from "@/lib/post-details";
import { publishedPostPaths } from "@/lib/published-routes.generated";

// The approved identity of the essay: shared contentId, Portuguese original,
// English translation, both published. The body is checked by the parity suite.
const ID = "acho-que-nao-deveriamos-ter-conseguido-fazer-isso";
const PT_SLUG = "acho-que-nao-deveriamos-ter-conseguido-fazer-isso";
const EN_SLUG = "we-probably-shouldnt-have-been-able-to-do-that";
const version = (locale: "en" | "pt-BR") =>
  getPublishedPosts(locale).find((post) => post.contentId === ID)!;

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
    expect(en.description).toBe(
      "About the time a friend and I found a price tampering bug and an IDOR in an ERP, and reported both.",
    );
    expect(pt.description).toBe(
      "Sobre a vez em que um amigo e eu encontramos uma falha de price tampering e um IDOR em um ERP e reportamos as duas falhas.",
    );
    expect(en.publishedAt).toBe("2026-11-02");
    expect(pt.publishedAt).toBe(en.publishedAt);
    expect(en.tags).toEqual(["personal", "security"]);
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

  it("has no sections: the essay is a single run of short paragraphs", () => {
    expect(getPostDetails(version("en")).headings).toEqual([]);
    expect(getPostDetails(version("pt-BR")).headings).toEqual([]);
  });
});
