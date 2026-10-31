import { getPublishedPosts } from "@/lib/posts";
import { getPostDetails } from "@/lib/post-details";

// The approved identity of the essay: shared contentId, Portuguese original,
// English translation. The body is checked by the parity suite.
const ID = "algumas-coisas-nao-sabem-como-terminar";
const version = (locale: "en" | "pt-BR") =>
  getPublishedPosts(locale).find((post) => post.contentId === ID)!;

describe("Some Things Don't Know How to End", () => {
  it("is a Portuguese original with an English translation, dated once", () => {
    const en = version("en");
    const pt = version("pt-BR");
    expect([pt.slug, pt.title, pt.originalLocale]).toEqual([
      "algumas-coisas-nao-sabem-como-terminar",
      "Algumas Coisas Não Sabem Como Terminar",
      "pt-BR",
    ]);
    expect([en.slug, en.title, en.originalLocale]).toEqual([
      "some-things-dont-know-how-to-end",
      "Some Things Don't Know How to End",
      "pt-BR",
    ]);
    expect(en.description).toBe(
      "About goodbyes that never quite feel final, places we return to, and things I'm trying to turn into code.",
    );
    expect(pt.description).toBe(
      "Sobre despedidas que parecem temporárias, lugares aos quais voltamos e coisas que estou tentando transformar em código.",
    );
    expect(en.publishedAt).toBe(pt.publishedAt);
    expect(en.tags).toEqual(pt.tags);
  });

  it("keeps the four sections, in the same order in both languages", () => {
    expect(
      getPostDetails(version("pt-BR")).headings.map((h) => h.title),
    ).toEqual([
      "Lugares que continuam esperando",
      "O problema de voltar",
      "Coisas que deixamos para trás",
      "Ainda não encontrei um final",
    ]);
    expect(getPostDetails(version("en")).headings.map((h) => h.title)).toEqual([
      "Places That Keep Waiting",
      "The Problem With Coming Back",
      "Things We Leave Behind",
      "I Haven't Found an Ending Yet",
    ]);
  });
});
