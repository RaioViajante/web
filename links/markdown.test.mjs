import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Repository Markdown only (README, contributor docs, docs/, .github/ and each
// app's own docs). Relative links and #fragments must resolve; external links
// are the job of `pnpm links:external`, and site content is checked on the
// built HTML by `pnpm links:check`.
const root = resolve(fileURLToPath(import.meta.url), "../..");
const files = execFileSync("git", ["ls-files", "-z", "*.md"], {
  cwd: root,
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean)
  .filter(
    (file) =>
      !file.startsWith("apps/docs/src/content/") &&
      !file.startsWith("apps/dump/content/"),
  );

// GitHub's heading anchors: lowercase, drop punctuation, spaces to hyphens.
const slug = (heading) =>
  heading
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim()
    .replace(/\s/g, "-");

function anchors(path) {
  const seen = new Map();
  const out = new Set();
  let fenced = false;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    const match = !fenced && /^#{1,6}\s+(.*?)\s*#*$/.exec(line);
    if (!match) continue;
    const base = slug(match[1].replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"));
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    out.add(count ? `${base}-${count}` : base);
  }
  return out;
}

test("every relative Markdown link and fragment resolves", () => {
  const problems = [];
  for (const file of files) {
    const text = readFileSync(join(root, file), "utf8").replace(
      /```[\s\S]*?```/g,
      "",
    );
    const links = [
      ...text.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g),
      ...text.matchAll(/(?:href|src)="([^"]+)"/g),
    ].map((m) => m[1]);
    for (const link of links) {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(link)) continue;
      const [target, fragment] = link.split("#");
      const path = target
        ? resolve(root, dirname(file), target)
        : join(root, file);
      if (!existsSync(path)) {
        problems.push(`${file}: ${link} (missing file)`);
      } else if (fragment && statSync(path).isFile() && path.endsWith(".md")) {
        if (!anchors(path).has(fragment.toLowerCase())) {
          problems.push(`${file}: ${link} (missing heading)`);
        }
      }
    }
  }
  assert.deepEqual(problems, []);
});
