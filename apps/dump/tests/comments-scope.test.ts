import fs from "node:fs";
import path from "node:path";

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

const nonArticlePages = [
  "app/page.tsx",
  "app/archive/page.tsx",
  "app/tags/page.tsx",
  "app/tags/[tag]/page.tsx",
  "app/about/page.tsx",
  "app/uses/page.tsx",
  "app/not-found.tsx",
];

describe("comments rendering scope", () => {
  it("is wired into the article page's chrome", () => {
    expect(readFile("components/PostArticle.tsx")).toContain("<Comments");
  });

  it.each(nonArticlePages)(
    "does not render comments on %s",
    (relPath: string) => {
      expect(readFile(relPath)).not.toMatch(/Comments/);
    },
  );
});
