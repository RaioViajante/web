/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { getAllPosts } from "@/lib/posts";

// English inside a Portuguese post is marked with an inline
// `<span lang="en">…</span>` (the markup docs/i18n.md prescribes), so screen
// readers switch voice for it. The posts are compiled without a components
// map, so this is the only raw markup a post may contain. These tests guard
// where it may sit; the rendered attribute is asserted in
// e2e/dump-locale-navigation.spec.ts.
const DIRECTORY = path.join(process.cwd(), "content", "posts");
const SPAN = /<span lang="en">([^<>]+)<\/span>/g;
const HAS_SPAN = /<span lang="en">/;

interface Line {
  text: string;
  inFence: boolean;
}

function linesOf(slug: string): Line[] {
  const body = matter(
    fs.readFileSync(path.join(DIRECTORY, `${slug}.mdx`), "utf8"),
  ).content;
  let inFence = false;
  return body.split("\n").map((text) => {
    if (text.startsWith("```")) {
      inFence = !inFence;
      return { text, inFence: true };
    }
    return { text, inFence };
  });
}

const posts = getAllPosts();

describe("English fragments in Portuguese posts", () => {
  it("marks some English with lang=en, only in Portuguese-locale posts", () => {
    const annotated = posts.filter((post) =>
      linesOf(post.slug).some((line) => HAS_SPAN.test(line.text)),
    );
    expect(annotated.length).toBeGreaterThan(0);
    for (const post of annotated) expect(post.locale).toBe("pt-BR");
  });

  it.each(posts.map((post) => [post.slug, post] as const))(
    "%s uses only well-formed inline spans in prose",
    (slug) => {
      for (const { text, inFence } of linesOf(slug)) {
        if (inFence) continue;
        const outsideCode = text.replace(/`[^`]*`/g, "");
        const real = outsideCode.match(/<\/?[A-Za-z][^>]*>/g) ?? [];
        // Only `<span lang="en">` and `</span>` may appear in prose.
        for (const tag of real)
          expect(['<span lang="en">', "</span>"]).toContain(tag);
        const opens = real.filter((tag) => tag === '<span lang="en">').length;
        const closes = real.filter((tag) => tag === "</span>").length;
        expect(opens).toBe(closes);
        if (opens > 0) {
          // Never in a heading (ids and the outline come from heading text),
          // and the wrapped text is never code, a path or an identifier.
          expect(text).not.toMatch(/^#{1,6} /);
          for (const match of text.matchAll(SPAN)) {
            expect(match[1]).not.toMatch(/[`/_.]/);
            expect(match[1]!.trim()).toBe(match[1]);
          }
        }
      }
    },
  );
});
