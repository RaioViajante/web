import { labSuggestions } from "@/lib/lab-suggestions";
import { headingSlug, headingText, labForPost } from "@/lib/post-details";
import type { Post } from "@/lib/posts";
import { RETIRED_CONTENT_IDS } from "./retired-content-ids";

// The "on this page" links must equal the ids rehype-slug gives the rendered
// headings (github-slugger rules). A literal underscore is text, not emphasis.
describe("heading ids", () => {
  it("keeps underscores inside words and strips code ticks", () => {
    const text = headingText("`tmp_path` looks like magic");
    expect(text).toBe("tmp_path looks like magic");
    expect(headingSlug(text)).toBe("tmp_path-looks-like-magic");
  });

  it("removes emphasis markers but not word underscores", () => {
    expect(headingText("Why _this_ and **that** matter")).toBe(
      "Why this and that matter",
    );
    expect(headingText("snake_case_name")).toBe("snake_case_name");
  });

  it("drops punctuation, keeps letters, digits, hyphens and accents", () => {
    expect(headingSlug("What's new? 2026 — réécriture, step-by-step")).toBe(
      "whats-new-2026--réécriture-step-by-step",
    );
  });
});

describe("automatic Lab links", () => {
  const post: Post = {
    slug: "boot",
    contentId: "boot",
    locale: "en",
    originalLocale: "en",
    title: "Boot",
    description: "d",
    publishedAt: "2026-01-01",
    tags: ["osdev"],
    draft: false,
  };

  it("keeps the existing English demonstration link", () => {
    expect(labForPost(post)?.href).toBe(
      "https://lab.raioviajante.com/experiments/boot-sector/",
    );
  });

  it("offers each Lab page in the post's own language", () => {
    const make = (
      tags: string[],
      locale: "en" | "pt-BR",
      contentId: string,
    ) => ({
      ...post,
      contentId,
      tags,
      locale,
      originalLocale: locale,
    });
    // Boot-sector reaches its own Portuguese page.
    expect(labForPost(make(["osdev"], "pt-BR", "boot"))?.href).toBe(
      "https://lab.raioviajante.com/pt/experiments/setor-de-boot/",
    );
    // Only a tagged topic reaches a Lab page: a post with no matching tag gets
    // none, whatever its contentId, and a retired work's id grants nothing.
    for (const contentId of [
      "kept-building-and-stopped-writing-it-down",
      ...RETIRED_CONTENT_IDS,
    ])
      for (const locale of ["en", "pt-BR"] as const)
        expect(labForPost(make(["meta"], locale, contentId))).toBeNull();
  });

  it("never points a Portuguese suggestion at an English page", () => {
    for (const suggestion of Object.values(labSuggestions["pt-BR"]))
      expect(suggestion.href).toContain("/pt/experiments/");
  });
});
