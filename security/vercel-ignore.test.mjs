import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Each app's Ignored Build Step must rebuild when shared code outside the app
// changes, and stay within Vercel's 256-character limit for the command.
const shared = [
  "../../package.json",
  "../../pnpm-*", // lockfile and workspace file
  "../../packages/design",
  "../../security",
  "../../seo",
  "../../site",
];

test("every ignoreCommand is identical, short enough, and watches shared code", async () => {
  const commands = await Promise.all(
    ["root", "dump", "docs", "lab"].map(
      async (app) =>
        JSON.parse(
          await readFile(
            new URL(`../apps/${app}/vercel.json`, import.meta.url),
            "utf8",
          ),
        ).ignoreCommand,
    ),
  );
  assert.equal(new Set(commands).size, 1);
  assert.ok(commands[0].length <= 256, `${commands[0].length} characters`);
  for (const path of shared) assert.ok(commands[0].includes(path), path);
});
