import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const css = ["tokens.css", "project-art.css"]
  .map((file) =>
    readFileSync(new URL(`../styles/${file}`, import.meta.url), "utf8"),
  )
  .join("\n");
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
it("keeps the text inside project artwork at 4.5:1 on its surfaces", () => {
  const pairs: [string[], string[]][] = [
    [
      ["mochi-ink", "mochi-muted", "mochi-faint"],
      ["mochi-bg", "mochi-window", "mochi-paper", "mochi-track"],
    ],
    [["mochi-ink"], ["mochi-hill", "mochi-sun"]],
    [["mochi-window"], ["mochi-ink"]],
    [
      [
        "ordelis-fg",
        "ordelis-fg-2",
        "ordelis-fg-3",
        "ordelis-ok",
        "ordelis-removed",
        "ordelis-note",
      ],
      ["ordelis-bg", "ordelis-card", "ordelis-you"],
    ],
    [["ordelis-you"], ["ordelis-fg"]],
    [["ordelis-fg"], ["ordelis-line-strong"]],
    [["refrain-ink", "refrain-ink-2"], ["refrain-paper"]],
    [
      [
        "orbit-fg",
        "orbit-fg-2",
        "orbit-accent",
        "orbit-light",
        "orbit-failed",
        "orbit-cancelled",
      ],
      ["orbit-bg"],
    ],
    [["orbit-button-fg"], ["orbit-accent"]],
    [
      [
        "yanawa-fg",
        "yanawa-muted",
        "yanawa-keyword",
        "yanawa-type",
        "yanawa-string",
      ],
      ["yanawa-bg", "yanawa-node"],
    ],
    [["sweep-fg", "sweep-file", "sweep-muted", "sweep-ok"], ["sweep-bg"]],
    [["hum-fg", "hum-bright", "hum-muted", "hum-accent"], ["hum-bg"]],
    // the initials standing in for a logo (apps/root .pj-letter)
    [["sweep-bg"], ["sweep-ok"]],
    [["hum-bg"], ["hum-accent"]],
  ];
  for (const [foregrounds, backgrounds] of pairs)
    for (const fg of foregrounds)
      for (const bg of backgrounds) {
        const [light, dark] = [luminance(color(fg)), luminance(color(bg))].sort(
          (a, b) => b - a,
        );
        expect(
          (light! + 0.05) / (dark! + 0.05),
          `${fg} on ${bg}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
});

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
