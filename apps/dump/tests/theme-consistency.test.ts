import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(
  path.join(process.cwd(), "app", "globals.css"),
  "utf8",
);

function themeBlock(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escaped}[^{]*\\{([^}]+)\\}`))?.[1] ?? "";
}

const light = themeBlock(":root,");
const dark = themeBlock('[data-theme="dark"]');

describe("theme tokens", () => {
  it("defines the core palette for both themes", () => {
    for (const token of ["--bg", "--fg", "--accent"]) {
      expect(light).toContain(token);
      expect(dark).toContain(token);
    }
  });

  it("tunes muted text per theme so both clear AA on paper and on charcoal", () => {
    // Same fg-mix percentage reads much fainter on the light background, so the
    // two themes carry their own value instead of one shared formula.
    expect(light).toMatch(/--color-muted:\s*color-mix\([^)]*var\(--fg\) 65%/);
    expect(dark).toMatch(/--color-muted:\s*color-mix\([^)]*var\(--fg\) 55%/);
  });

  it("follows the active theme for the fenced-code surface", () => {
    // Issue: the fenced-code surface used to stay dark in both themes. Each
    // theme now carries its own --code-surface, matching its Shiki theme.
    expect(dark).toMatch(/--code-surface:\s*#201c29/);
    expect(light).toMatch(/--code-surface:\s*color-mix\(/);
  });

  it("derives selection colour from a token rather than a literal", () => {
    expect(css).toMatch(
      /::selection\s*\{[^}]*background:\s*var\(--selection-bg\)/,
    );
  });

  it("does not branch the theme on a CSS media query", () => {
    // Theme is attribute-driven (set before paint in the layout); there is no
    // prefers-color-scheme fork in the stylesheet.
    expect(css).not.toMatch(/prefers-color-scheme/);
  });
});
