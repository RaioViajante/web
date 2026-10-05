import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(
  path.join(process.cwd(), "app", "globals.css"),
  "utf8",
);

describe("responsive layout", () => {
  it("moves the sidebar above content on narrow screens", () => {
    expect(css).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.dump-shell \.rv-layout\s*\{\s*display: block/,
    );
  });
  it("allows code to scroll within the reading column", () => {
    expect(css).toMatch(/\.prose pre\s*\{[^}]*overflow-x: auto/);
  });
});
