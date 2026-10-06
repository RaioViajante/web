import fs from "node:fs";
import path from "node:path";

const layout = fs.readFileSync(
  path.join(process.cwd(), "app", "layout.tsx"),
  "utf8",
);
const globals = fs.readFileSync(
  path.join(process.cwd(), "app", "globals.css"),
  "utf8",
);

describe("shared design system", () => {
  it("loads the shared styles, font and behavior script", () => {
    expect(layout).toContain("@raioviajante/design/styles.css");
    expect(layout).toContain("@raioviajante/design/behavior-react");
    expect(layout).toContain("next/font/local");
    expect(layout).toContain("NotoSansMono-Latin-Variable.woff2");
    expect(layout).not.toContain("editorial.css");
  });

  it("keeps no literal colors in the app's own styles", () => {
    expect(globals).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
  });
});
