import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyFilename } from "../src/lib/filename-classifier.ts";

// Python 3.14 POSIX suffix behavior, with Sweep 3544d36 category sets.
for (const [filename, suffix, category] of [
  [".hidden", "", "Other"],
  ["archive.tar.gz", ".gz", "Archives"],
  ["README", "", "Other"],
  ["image.", ".", "Other"],
  ["PHOTO.PNG", ".png", "Images"],
  ["REPORT.PDF", ".pdf", "Documents"],
  ["notes.final.MD", ".md", "Documents"],
  ["backup.TAR", ".tar", "Archives"],
  [".config.toml", ".toml", "Other"],
  ["..hidden", "", "Other"],
  ["...photo.PNG", ".png", "Images"],
  ["folder.with.dot/README", "", "Other"],
  ["dir/photo.png/.", ".png", "Images"],
  [" notes.txt ", ".txt ", "Other"],
]) {
  test(`classifies ${JSON.stringify(filename)}`, () => {
    assert.deepEqual(classifyFilename(filename), {
      filename,
      suffix,
      category,
    });
  });
}
