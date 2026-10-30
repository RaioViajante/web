/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

// A client component's imports ship to the browser. Dump's page catalog
// (lib/copy.ts) holds every page's SEO copy, the 404 copy and both locales'
// prose, so no client component may import it; they use small dedicated
// modules such as lib/comments-copy.ts.
const ROOTS = ["components", "app", "lib"];

function sources(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return sources(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

describe("client components", () => {
  const clients = ROOTS.flatMap((root) =>
    sources(path.join(process.cwd(), root)),
  ).filter((file) =>
    /^\s*["']use client["']/.test(fs.readFileSync(file, "utf8")),
  );

  it("exist (the guard is not vacuous)", () => {
    expect(clients.map((file) => path.basename(file))).toContain(
      "Comments.tsx",
    );
  });

  it.each(clients.map((file) => [path.relative(process.cwd(), file), file]))(
    "%s does not import the page catalog",
    (_name, file) => {
      const source = fs.readFileSync(file as string, "utf8");
      expect(source).not.toMatch(
        /from\s+["'](@\/lib\/copy|\.{1,2}\/(lib\/)?copy)["']/,
      );
    },
  );
});
