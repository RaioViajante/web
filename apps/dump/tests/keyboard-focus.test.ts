import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(
  path.join(process.cwd(), "app", "globals.css"),
  "utf8",
);
const layout = fs.readFileSync(
  path.join(process.cwd(), "app", "layout.tsx"),
  "utf8",
);
const shared = fs.readFileSync(
  path.join(process.cwd(), "..", "..", "packages", "design", "editorial.css"),
  "utf8",
);

describe("keyboard access", () => {
  it("inherits the shared focus indicator", () => {
    expect(shared).toMatch(/\.rv-shell :focus-visible\s*\{/);
    expect(shared).toContain("--rv-editorial-focus-width");
  });
  it("keeps the skip link first and makes it visible on focus", () => {
    expect(layout.indexOf('href="#content"')).toBeLessThan(
      layout.indexOf("<SiteHeader"),
    );
    expect(css).toMatch(/\.skip-link:focus\s*\{/);
  });
});
