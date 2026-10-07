// Line-based reading of workflow text, used by workflows.test.mjs. Scanning
// lines keeps the work linear however many blank lines a file has.

/**
 * Whether the top-level `permissions:` block is exactly `contents: read`: the
 * next line is that entry and the first non-blank line after it is a new
 * top-level key, so nothing else is granted.
 */
export function topLevelPermissionsAreReadOnly(code) {
  const lines = code.split("\n");
  const start = lines.findIndex((line) => line.trimEnd() === "permissions:");
  if (start === -1 || lines[start + 1]?.trimEnd() !== "  contents: read") {
    return false;
  }
  for (const line of lines.slice(start + 2)) {
    if (line.trim() === "") continue;
    return !/^\s/.test(line);
  }
  return false;
}
