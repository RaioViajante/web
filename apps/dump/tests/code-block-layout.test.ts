import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(
  path.join(process.cwd(), "app", "globals.css"),
  "utf8",
);
const nextConfig = fs.readFileSync(
  path.join(process.cwd(), "next.config.mjs"),
  "utf8",
);

function cssRule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))?.[1] ?? "";
}

describe("fenced code layout", () => {
  it("lets source newlines define rows instead of a grid", () => {
    expect(nextConfig).toMatch(/grid:\s*false/);
    expect(cssRule(".prose pre code")).toMatch(/display:\s*block/);
    expect(cssRule(".prose pre code")).not.toMatch(/display:\s*(grid|flex)/);
  });

  it("preserves source lines in a naturally sized scrolling block", () => {
    const pre = cssRule(".prose pre");

    expect(pre).toMatch(/white-space:\s*pre/);
    expect(pre).toMatch(/overflow-x:\s*auto/);
    expect(pre).not.toMatch(/(?:^|[;\n]\s*)(?:min-)?height\s*:/);
  });
});
