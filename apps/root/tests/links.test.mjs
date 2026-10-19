import assert from "node:assert/strict";
import test from "node:test";
import { identity } from "../../../seo/structured-data.ts";
import { ptHome } from "../lib/pt.ts";
import {
  primaryLinks,
  profileLinks,
  socialLinks,
  videoSourceLink,
} from "../lib/links.ts";

const byLabel = (links) =>
  Object.fromEntries(links.map((l) => [l.label, l.href]));

test("social profiles use the raioviajando handle with platform-only labels", () => {
  assert.deepEqual(byLabel(socialLinks), {
    Instagram: "https://www.instagram.com/raioviajando/",
    X: "https://x.com/raioviajando",
    YouTube: "https://www.youtube.com/@raioviajando",
    TikTok: "https://www.tiktok.com/@raioviajando",
  });
});

test("personal GitHub and the video-code organization stay distinct", () => {
  assert.equal(identity.github, "https://github.com/RaioViajante");
  assert.equal(videoSourceLink.label, "Video Source Code");
  assert.equal(videoSourceLink.href, "https://github.com/raioviajando");
  assert.notEqual(videoSourceLink.href, identity.github);
  // The organization is not a profile of the person.
  assert.equal(videoSourceLink.rel, undefined);
  const github = primaryLinks.filter((l) => l.href === identity.github);
  assert.equal(github.length, 1);
  assert.equal(github[0].label, "GitHub");
  assert.equal(github[0].rel, "me");
});

test("home links and gallery profile links share the registry without duplicates", () => {
  const home = primaryLinks.filter((l) => !l.href.startsWith("mailto:"));
  assert.deepEqual(
    [...home.map((l) => l.href)].sort(),
    [...profileLinks.map((l) => l.href)].sort(),
  );
  for (const links of [primaryLinks, profileLinks])
    assert.equal(new Set(links.map((l) => l.href)).size, links.length);
  assert.equal(
    new Set(primaryLinks.map((l) => l.category)).size,
    primaryLinks.length,
  );
});

test("no current profile link keeps the old handle or a decorated label", () => {
  for (const link of [...profileLinks, ...primaryLinks]) {
    assert.ok(!/semrollback/i.test(link.href + link.label + link.description));
    assert.ok(!/[/@]/.test(link.label) || link.href.startsWith("mailto:"));
    assert.ok(!/most active/i.test(link.description));
  }
});

test("every home link category has Portuguese copy", () => {
  for (const link of primaryLinks) assert.ok(ptHome.linkCopy[link.category]);
});

test("only the video-code link has a localized Portuguese label", () => {
  assert.equal(videoSourceLink.label, "Video Source Code");
  assert.equal(ptHome.linkCopy.source.label, "Código dos Vídeos");
  for (const link of primaryLinks)
    if (link.category !== "source")
      assert.equal(ptHome.linkCopy[link.category].label, undefined);
});

test("only the video-code link has a Portuguese label; other labels stay platform names", () => {
  assert.equal(ptHome.linkCopy.source.label, "Código dos Vídeos");
  assert.equal(videoSourceLink.label, "Video Source Code");
  const relabeled = Object.entries(ptHome.linkCopy).filter(([, c]) => c.label);
  assert.deepEqual(
    relabeled.map(([k]) => k),
    ["source"],
  );
});
