import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(
  path.join(process.cwd(), "app", "globals.css"),
  "utf8",
);

function cssRule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))?.[1] ?? "";
}

describe("responsive layout containment", () => {
  it("lets the body grid shrink around internally scrolling content", () => {
    expect(cssRule("body")).toMatch(
      /grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
  });

  it("reserves narrow-screen footer space for the fixed theme control", () => {
    expect(css).toMatch(
      /@media \(max-width: 768px\)[\s\S]*?\.site-footer\s*\{[\s\S]*?padding-bottom:\s*max\(/,
    );
  });
});
