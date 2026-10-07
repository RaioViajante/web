import { headingSlug, headingText } from "@/lib/post-details";

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
