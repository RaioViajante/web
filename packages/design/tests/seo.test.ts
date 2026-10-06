import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  isNotFoundPath,
  pageMetadata,
  socialKey,
  sitemapResponse,
} from "../seo";

describe("page metadata", () => {
  it("keeps nested social paths distinct and normalizes trailing slashes", () => {
    expect(socialKey("/")).toBe("index.png");
    expect(socialKey("/projects/sweep/")).toBe("projects/sweep.png");
    expect(socialKey("/projects/sweep-cli")).not.toBe(
      socialKey("/projects/sweep/cli"),
    );
  });
  it("gives each page its own canonical, title and social image", () => {
    const value = pageMetadata("https://docs.raioviajante.com", "docs", {
      path: "/projects/sweep/",
      title: "Sweep",
      description: "Organize files.",
    });
    expect(value.title).toEqual({ absolute: "Sweep — docs" });
    expect(value.alternates.canonical).toBe("/projects/sweep/");
    expect(value.openGraph.url).toBe(
      "https://docs.raioviajante.com/projects/sweep/",
    );
    expect(value.twitter.images).toEqual(value.openGraph.images);
    expect(value.openGraph.images[0]?.url).toBe(
      "https://docs.raioviajante.com/og/projects/sweep.png",
    );
  });
  it("recognizes every way a host serves its 404 page", () => {
    for (const path of ["/404", "/404/", "/404.html"]) {
      expect(isNotFoundPath(path)).toBe(true);
    }
    expect(isNotFoundPath("/404-notes/")).toBe(false);
    expect(socialKey("/404/")).toBe(socialKey("/404"));
  });
  it("escapes XML URLs without inventing modification dates", async () => {
    const body = await sitemapResponse("https://example.com", [
      "/a?b=1&c=2",
    ]).text();
    expect(body).toContain("b=1&amp;c=2");
    expect(body).not.toContain("lastmod");
  });
});

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
