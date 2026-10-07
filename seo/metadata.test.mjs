import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import {
  isNotFoundPath,
  isSearchPath,
  pageMetadata,
  sitemapResponse,
  socialKey,
  webManifest,
} from "./metadata.ts";

test("social keys keep nested paths distinct and normalize trailing slashes", () => {
  assert.equal(socialKey("/"), "index.png");
  assert.equal(socialKey("/projects/sweep/"), "projects/sweep.png");
  assert.notEqual(socialKey("/projects/sweep-cli"), socialKey("/projects/sweep/cli"));
});

test("each page gets its own canonical, title and social image", () => {
  const value = pageMetadata("https://docs.raioviajante.com", "docs", {
    path: "/projects/sweep/",
    title: "Sweep",
    description: "Organize files.",
  });
  assert.deepEqual(value.title, { absolute: "Sweep — docs" });
  assert.equal(value.alternates.canonical, "/projects/sweep/");
  assert.equal(value.openGraph.url, "https://docs.raioviajante.com/projects/sweep/");
  assert.deepEqual(value.twitter.images, value.openGraph.images);
  assert.equal(
    value.openGraph.images[0]?.url,
    "https://docs.raioviajante.com/og/projects/sweep.png",
  );
});

test("every way a host serves its 404 page is recognised", () => {
  for (const path of ["/404", "/404/", "/404.html"]) {
    assert.equal(isNotFoundPath(path), true);
  }
  assert.equal(isNotFoundPath("/404-notes/"), false);
  assert.equal(socialKey("/404/"), socialKey("/404"));
});

test("sitemaps escape URLs and only emit lastmod when known", async () => {
  const escaped = await sitemapResponse("https://example.com", ["/a?b=1&c=2"]).text();
  assert.ok(escaped.includes("b=1&amp;c=2"));
  assert.ok(!escaped.includes("lastmod"));
  const xml = await sitemapResponse("https://x.example", [
    "/a",
    { path: "/b", lastmod: "2026-09-07" },
  ]).text();
  assert.ok(xml.includes("<loc>https://x.example/a</loc></url>"));
  assert.ok(xml.includes("<loc>https://x.example/b</loc><lastmod>2026-09-07</lastmod>"));
  assert.equal(xml.match(/<lastmod>/g)?.length, 1);
});

test("the manifest names the site without claiming an app shell", () => {
  const manifest = webManifest("docs", { themeColor: "#191919" });
  assert.equal(manifest.display, "browser");
  assert.equal(manifest.theme_color, "#191919");
  assert.equal(manifest.background_color, "#191919");
  assert.ok(!("theme_color" in webManifest("docs")));
  assert.ok(!("scope" in manifest));
});

test("manifest icons are files the site actually serves", () => {
  for (const icon of webManifest("lab").icons) {
    assert.ok(existsSync(new URL(`../apps/lab/public${icon.src}`, import.meta.url)), icon.src);
  }
});

test("the search page is noindex, follow, keeps its canonical and is not in sitemaps", async () => {
  assert.equal(isSearchPath("/search"), true);
  assert.equal(isSearchPath("/search/"), true);
  assert.equal(isSearchPath("/searching"), false);
  assert.equal(isSearchPath("/projects/search/"), false);
  const search = pageMetadata("https://x.example", "x", {
    path: "/search",
    title: "Search",
    description: "d",
  });
  assert.deepEqual(search.robots, { index: false, follow: true });
  assert.equal(search.alternates.canonical, "/search");
  const other = pageMetadata("https://x.example", "x", {
    path: "/about",
    title: "About",
    description: "d",
  });
  assert.ok(!("robots" in other));
  const xml = await sitemapResponse("https://x.example", [
    "/",
    "/search",
    "/search/",
    "/404",
    "/about",
  ]).text();
  assert.ok(!xml.includes("search"));
  assert.ok(!xml.includes("404"));
  assert.ok(xml.includes("/about"));
});
