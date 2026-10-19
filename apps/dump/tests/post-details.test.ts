import { headingSlug, headingText, labForPost } from "@/lib/post-details";
import type { Post } from "@/lib/posts";

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

  it("suppresses the automatic English-only link in Portuguese", () => {
    expect(
      labForPost({ ...post, locale: "pt-BR", originalLocale: "pt-BR" }),
    ).toBeNull();
  });
});
