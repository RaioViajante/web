/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

import { GET as giscusTheme } from "@/app/giscus.css/route";
import { sectionNumber } from "@raioviajante/design/sections";

const nextConfig = fs.readFileSync(
  path.join(process.cwd(), "next.config.mjs"),
  "utf8",
);

describe("removed pages", () => {
  it("redirects About and Uses to the root site", () => {
    expect(nextConfig).toContain('source: "/about"');
    expect(nextConfig).toContain("https://raioviajante.com/about");
    expect(nextConfig).toContain('source: "/uses"');
    expect(nextConfig).toContain("https://raioviajante.com/setup");
    expect(nextConfig.match(/permanent: true/g)).toHaveLength(2);
    expect(fs.existsSync(path.join(process.cwd(), "app/about"))).toBe(false);
    expect(fs.existsSync(path.join(process.cwd(), "app/uses"))).toBe(false);
  });
});

describe("post sections", () => {
  it("numbers sections 01., 01.1, 01.2", () => {
    expect([0, 1, 2].map(sectionNumber)).toEqual(["01.", "01.1", "01.2"]);
  });
});

describe("giscus theme", () => {
  it("is built from the shared tokens", async () => {
    const response = giscusTheme();
    const css = await response.text();
    const tokens = fs.readFileSync(
      path.join(
        process.cwd(),
        "..",
        "..",
        "packages",
        "design",
        "styles",
        "tokens.css",
      ),
      "utf8",
    );
    const bg = /--bg:\s*([^;]+);/.exec(tokens)![1]!.trim();
    const fg = /--fg:\s*([^;]+);/.exec(tokens)![1]!.trim();
    expect(css).toContain(`--color-canvas-default: ${bg};`);
    expect(css).toContain(`--color-fg-default: ${fg};`);
    expect(css).not.toContain("inherit;");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://giscus.app",
    );
  });
});
