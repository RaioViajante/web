import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  isNotFoundPath,
  isSearchPath,
  pageMetadata,
  socialKey,
  sitemapResponse,
  webManifest,
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

describe("sitemap lastmod", () => {
  it("emits lastmod only for entries that have one", async () => {
    const xml = await sitemapResponse("https://x.example", [
      "/a",
      { path: "/b", lastmod: "2026-09-07" },
    ]).text();
    expect(xml).toContain("<loc>https://x.example/a</loc></url>");
    expect(xml).toContain(
      "<loc>https://x.example/b</loc><lastmod>2026-09-07</lastmod>",
    );
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
  });
});

describe("manifest", () => {
  it("names the site and colors without claiming an app shell", () => {
    const manifest = webManifest("docs", { themeColor: "#191919" });
    expect(manifest.display).toBe("browser");
    expect(manifest.theme_color).toBe("#191919");
    expect(manifest.background_color).toBe("#191919");
    expect(webManifest("docs")).not.toHaveProperty("theme_color");
    expect(manifest).not.toHaveProperty("scope");
  });
});

describe("search page", () => {
  it("is recognised with and without a trailing slash, and nothing else", () => {
    expect(isSearchPath("/search")).toBe(true);
    expect(isSearchPath("/search/")).toBe(true);
    expect(isSearchPath("/searching")).toBe(false);
    expect(isSearchPath("/projects/search/")).toBe(false);
  });

  it("is noindex, follow in page metadata but keeps its bare canonical", () => {
    const search = pageMetadata("https://x.example", "x", {
      path: "/search",
      title: "Search",
      description: "d",
    });
    expect(search.robots).toEqual({ index: false, follow: true });
    expect(search.alternates.canonical).toBe("/search");
    const other = pageMetadata("https://x.example", "x", {
      path: "/about",
      title: "About",
      description: "d",
    });
    expect(other).not.toHaveProperty("robots");
  });

  it("never appears in a sitemap, nor does the 404 page", async () => {
    const xml = await sitemapResponse("https://x.example", [
      "/",
      "/search",
      "/search/",
      "/404",
      "/about",
    ]).text();
    expect(xml).not.toContain("search");
    expect(xml).not.toContain("404");
    expect(xml).toContain("/about");
  });
});
