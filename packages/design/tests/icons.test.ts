import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error -- plain ESM build script, no type declarations
import { appCopies } from "../scripts/icon-copies.mjs";
import { webManifest } from "../seo";

const read = (path: string) => readFileSync(new URL(path, import.meta.url));

describe("site icons", () => {
  it("serves byte-identical copies of the shared icon set on every site", () => {
    for (const [target, name] of Object.entries(
      appCopies as Record<string, string>,
    )) {
      expect(
        read(`../../../${target}`).equals(read(`../assets/icons/${name}`)),
        `${target} is out of date: run pnpm --filter @raioviajante/design icons`,
      ).toBe(true);
    }
  });

  it("lists icons the sites actually serve in the manifest", () => {
    const sources = webManifest("lab").icons.map((icon) => icon.src);
    const served = Object.keys(appCopies as Record<string, string>)
      .filter((target) => target.startsWith("apps/lab/public/"))
      .map((target) => target.replace("apps/lab/public", ""));
    for (const src of sources) expect(served).toContain(src);
  });
});
