/** @jest-environment node */
import { GET as portugueseIndex } from "@/app/pt/search-index.json/route";
import { searchSuggestions } from "@/lib/search-suggestions";
import { getPublishedPosts } from "@/lib/posts";

// The shared engine matches when every word of the query appears in the
// accent- and case-folded title, description or body of an entry. This mirrors
// that rule on the real built index; the browser pass runs the real engine.
const fold = (text: string) =>
  text.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{M}/gu, "");

interface Entry {
  title: string;
  description: string;
  body: string;
}

describe("Portuguese search suggestions", () => {
  it("offers explicit Portuguese suggestions, and only for the non-default locale", () => {
    expect(searchSuggestions["pt-BR"]!.site.length).toBeGreaterThanOrEqual(3);
    expect(searchSuggestions.en).toBeUndefined();
  });

  it("finds at least one published Portuguese entry for every site suggestion", async () => {
    const entries = (await portugueseIndex().json()) as Entry[];
    expect(entries).toHaveLength(getPublishedPosts("pt-BR").length);
    for (const term of searchSuggestions["pt-BR"]!.site) {
      const words = fold(term).split(/\s+/);
      const hits = entries.filter((entry) =>
        words.every((word) =>
          fold(`${entry.title} ${entry.description} ${entry.body}`).includes(
            word,
          ),
        ),
      );
      expect({ term, hits: hits.length > 0 }).toEqual({ term, hits: true });
    }
  });

  it("does not repeat the English defaults that match nothing in Portuguese", () => {
    const all = [
      ...searchSuggestions["pt-BR"]!.site,
      ...searchSuggestions["pt-BR"]!.everywhere,
    ];
    for (const english of ["language", "scheduler", "tokens", "commits"])
      expect(all).not.toContain(english);
  });
});
