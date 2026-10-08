import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

// CI and Vercel always build with an empty content store, which renders every
// Markdown file through Astro's Vite module runner. A warm local store skips
// that path, so remove it and build for real into a throwaway directory.
test("a cold-cache production build keeps semantic headings in the search index", () => {
  rmSync(join(root, "node_modules/.astro/data-store.json"), { force: true });
  const outDir = mkdtempSync(join(tmpdir(), "docs-build-"));
  try {
    const build = spawnSync(
      join(root, "node_modules/.bin/astro"),
      ["build", "--outDir", outDir],
      { cwd: root, encoding: "utf8" },
    );
    const output = `${build.stdout}\n${build.stderr}`;
    assert.equal(build.status, 0, output);
    assert.doesNotMatch(output, /module runner has been closed/i);

    const entries = JSON.parse(readFileSync(join(outDir, "search-index.json"), "utf8"));
    const section = entries.find(
      ({ href, description }) => description === "Sweep" && href.endsWith("/projects/sweep/#classification"),
    );
    assert.equal(section?.title, "Classification");
    assert.ok(entries.every(({ title }) => !/^\d{2}\./.test(title)), "no numbered titles");
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
