import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const css = readFileSync(
  new URL("../styles/tokens.css", import.meta.url),
  "utf8",
);
const color = (name: string) => {
  const value = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6});`))?.[1];
  if (!value) throw new Error(`Missing color: ${name}`);
  return value;
};
const luminance = (hex: string) =>
  [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4))
    .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i]!, 0);
it("keeps every code text color at 4.5:1 on all solid code surfaces", () => {
  for (const fg of [
    "fg",
    "fg-2",
    "code-line-number",
    "syn-keyword",
    "syn-type",
    "syn-function",
    "syn-string",
    "syn-number",
    "syn-comment",
  ]) {
    for (const bg of [
      "block",
      "block-inner",
      "block-terminal",
      "code-highlight",
      "block-button",
    ]) {
      const contrast =
        (luminance(color(fg)) + 0.05) / (luminance(color(bg)) + 0.05);
      expect(contrast, `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});
