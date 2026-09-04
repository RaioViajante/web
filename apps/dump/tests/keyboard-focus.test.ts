import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
const layout = fs.readFileSync(path.join(root, "app", "layout.tsx"), "utf8");

function cssRule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))?.[1] ?? "";
}

describe("focus-visible system", () => {
  it("gives every focusable element a visible accent ring", () => {
    const rule = cssRule(":focus-visible");
    expect(rule).toMatch(/outline:\s*2px solid var\(--accent\)/);
    expect(rule).toMatch(/outline-offset:/);
    expect(rule).not.toMatch(/outline:\s*none/);
  });

  it("keeps the ring readable on the always-dark code surface", () => {
    // The code surface does not change with the theme, so the light-theme
    // accent would be too dark to see against it.
    expect(css).toMatch(
      /\.prose pre:focus-visible[\s\S]{0,80}\{\s*outline-color:\s*var\(--code-accent\)/,
    );
  });

  it("distinguishes the active nav item from keyboard focus", () => {
    // Active state = colour + weight; focus state = an outline ring. A user can
    // see both "current page" and "focused element" at once.
    const active = cssRule(".primary-navigation a.is-active");
    expect(active).toMatch(/font-weight:/);
    expect(active).toMatch(/color:\s*var\(--accent\)/);
    expect(active).not.toMatch(/outline/);
  });

  it("does not draw a ring on the programmatic skip-link target", () => {
    expect(cssRule("main:focus")).toMatch(/outline:\s*none/);
  });
});

describe("skip link", () => {
  it("is the first focusable element and points at the main landmark", () => {
    const skipIndex = layout.indexOf('href="#content"');
    const headerIndex = layout.indexOf("<SiteHeader");
    expect(skipIndex).toBeGreaterThan(-1);
    expect(skipIndex).toBeLessThan(headerIndex);
    expect(layout).toMatch(/<main id="content" tabIndex=\{-1\}>/);
  });

  it("is off-screen until it receives focus", () => {
    expect(cssRule(".skip-link")).toMatch(/left:\s*-9999px/);
    expect(cssRule(".skip-link:focus")).toMatch(/left:\s*var\(--space\)/);
  });
});
