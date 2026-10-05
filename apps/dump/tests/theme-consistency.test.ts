import fs from "node:fs";
import path from "node:path";

const layout = fs.readFileSync(
  path.join(process.cwd(), "app", "layout.tsx"),
  "utf8",
);
const tokens = fs.readFileSync(
  path.join(
    process.cwd(),
    "..",
    "..",
    "packages",
    "design",
    "editorial-tokens.css",
  ),
  "utf8",
);

describe("shared editorial design", () => {
  it("uses the Root's shell and Noto Sans Mono", () => {
    expect(layout).toContain("@raioviajante/design/editorial.css");
    expect(layout).toContain("Noto_Sans_Mono");
    expect(layout).toContain('className="rv-shell dump-shell"');
  });
  it("keeps typography and shell measures in shared tokens", () => {
    expect(tokens).toContain("--rv-editorial-font-family");
    expect(tokens).toContain("--rv-editorial-content-width");
    expect(tokens).toContain("--rv-editorial-shell-gap");
  });
});
