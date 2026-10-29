/** @jest-environment node */
import { LOCALE_IDS } from "../../../site/locales";
import { getAllTags, getPublishedPosts, type Post } from "@/lib/posts";
import { series } from "@/lib/post-details";
import { taxonomy } from "@/lib/tags";

// The localization coverage of the published works: every work written in one
// language has a published version in the other, and each translation carries
// its own publication date.
const works = (() => {
  const byWork = new Map<
    string,
    Partial<Record<(typeof LOCALE_IDS)[number], Post>>
  >();
  for (const locale of LOCALE_IDS)
    for (const post of getPublishedPosts(locale))
      byWork.set(post.contentId, {
        ...byWork.get(post.contentId),
        [locale]: post,
      });
  return byWork;
})();

const ENGLISH_ORIGINALS = [
  "a-toml-file-changed-what-sweep-was",
  "an-execution-is-more-than-a-row-in-a-database",
  "apparently-moving-a-file-has-edge-cases",
  "building-orbit",
  "gave-one-operation-more-than-one-deadline",
  "kept-building-and-stopped-writing-it-down",
  "maybe-this-can-be-something-someday",
  "my-project-cards-were-getting-ahead-of-my-projects",
  "split-my-internet-into-four-different-kinds-of-place",
  "started-designing-a-language-before-i-could-compile-one",
  "started-writing-down-the-failures-before-the-features",
  "there-is-no-printf-down-here",
];
const PORTUGUESE_ORIGINALS = ["traduzir-o-site-sem-fingir-que-tudo-ja-existe"];

describe("works x locale coverage", () => {
  it("covers all thirteen published works", () => {
    expect([...works.keys()].sort()).toEqual(
      [...ENGLISH_ORIGINALS, ...PORTUGUESE_ORIGINALS].sort(),
    );
  });

  it("gives every English original a Portuguese version", () => {
    for (const id of ENGLISH_ORIGINALS) {
      const { en, "pt-BR": pt } = works.get(id)!;
      expect(en?.originalLocale).toBe("en");
      expect(pt).toBeDefined();
      expect(pt!.originalLocale).toBe("en");
      expect(pt!.slug).not.toBe(en!.slug);
      expect(pt!.title).not.toBe(en!.title);
    }
  });

  it("gives every Portuguese original an English version", () => {
    for (const id of PORTUGUESE_ORIGINALS) {
      const { en, "pt-BR": pt } = works.get(id)!;
      expect(pt?.originalLocale).toBe("pt-BR");
      expect(en).toMatchObject({
        locale: "en",
        originalLocale: "pt-BR",
        publishedAt: "2026-10-29",
      });
      expect(en!.title).not.toBe(pt!.title);
    }
  });

  it("dates each new translation with its own first publication", () => {
    for (const { en, "pt-BR": pt } of works.values()) {
      const translation = en!.originalLocale === "en" ? pt! : en!;
      const original = en!.originalLocale === "en" ? en! : pt!;
      if (original.contentId === "maybe-this-can-be-something-someday") {
        // Translated before this change; its recorded date stays.
        expect(translation.publishedAt).toBe("2026-10-19");
      } else if (original.originalLocale === "en") {
        expect(translation.publishedAt).toBe("2026-10-29");
      }
      // An original's own date and any update are never touched by a translation.
      expect(translation.updatedAt).toBeUndefined();
    }
  });

  it("keeps every translation as full as its original", () => {
    for (const { en, "pt-BR": pt } of works.values()) {
      expect(en!.tags).toEqual(pt!.tags);
      expect(pt!.description.trim().length).toBeGreaterThan(20);
    }
  });

  it("keeps the series intact in both locales, keyed by contentId", () => {
    for (const item of series)
      for (const locale of LOCALE_IDS)
        expect(
          item.contentIds.filter((id) =>
            getPublishedPosts(locale).some((post) => post.contentId === id),
          ),
        ).toEqual(item.contentIds);
  });
});

describe("Portuguese tags", () => {
  it("gives every tag a Portuguese presentation, and a page only where a Portuguese post carries it", () => {
    const used = new Set(
      getPublishedPosts("pt-BR").flatMap((post) => post.tags),
    );
    expect(new Set(getAllTags("pt-BR").map(({ id }) => id))).toEqual(used);
    for (const { id } of taxonomy.definitions.filter((tag) =>
      used.has(tag.id),
    )) {
      const portuguese = taxonomy.presentation(id, "pt-BR");
      expect(portuguese).toBeDefined();
      expect(taxonomy.presentation(id, "en")).toBeDefined();
    }
  });

  it("keeps English tag labels and slugs equal to their ids", () => {
    for (const definition of taxonomy.definitions)
      expect(definition.locales.en).toEqual({
        label: definition.id,
        slug: definition.id,
      });
  });

  it("translates common words and leaves technical names alone", () => {
    const label = (id: string) => taxonomy.presentation(id, "pt-BR")!.label;
    expect(label("architecture")).toBe("arquitetura");
    expect(label("automation")).toBe("automação");
    expect(label("distributed-systems")).toBe("sistemas-distribuídos");
    for (const id of ["mcp", "python", "x86", "toml", "java", "spring"])
      expect(label(id)).toBe(id);
  });

  it("resolves Portuguese tag slugs exactly, without case folding or English aliases", () => {
    expect(taxonomy.idForSlug("pt-BR", "seguranca")).toBe("security");
    expect(taxonomy.idForSlug("pt-BR", "Seguranca")).toBeUndefined();
    expect(taxonomy.idForSlug("pt-BR", "security")).toBeUndefined();
    expect(taxonomy.idForSlug("en", "SECURITY")).toBe("security");
  });
});
