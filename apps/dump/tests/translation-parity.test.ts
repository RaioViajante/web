/** @jest-environment node */
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { getAllPosts } from "@/lib/posts";

// A translation must contain everything its original contains. This guards
// the structure, not the prose: headings, fenced code (verbatim apart from
// comments, and `text` fences, which may hold translated prose), inline code,
// links, images, lists, tables and directives, in the same order.
const DIRECTORY = path.join(process.cwd(), "content", "posts");

interface Structure {
  headings: string[];
  fences: { info: string; code: string; lines: string[] }[];
  inlineCode: string[];
  links: string[];
  images: string[];
  directives: number;
  lists: number;
  tables: number;
  quotes: number;
  blocks: number;
}

function structureOf(slug: string): Structure {
  const body = matter(
    fs.readFileSync(path.join(DIRECTORY, `${slug}.mdx`), "utf8"),
  ).content;
  const prose: string[] = [];
  const fences: Structure["fences"] = [];
  let current: { info: string; lines: string[] } | undefined;
  for (const line of body.split("\n")) {
    const fence = /^```(.*)$/.exec(line);
    if (fence) {
      if (current) {
        fences.push({ ...current, code: current.lines.join("\n") });
        current = undefined;
      } else current = { info: fence[1]!, lines: [] };
    } else if (current) current.lines.push(line);
    else prose.push(line);
  }
  if (current) throw new Error(`${slug}: unclosed code fence`);
  const text = prose.join("\n");
  return {
    headings: prose
      .filter((l) => /^#{2,6} /.test(l))
      .map((l) => /^#+/.exec(l)![0]),
    fences,
    inlineCode: [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]!),
    links: [...text.matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]!),
    images: [...text.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]!),
    directives: prose.filter((l) => /^:::/.test(l)).length,
    lists: prose.filter((l) => /^\s*([-*]|\d+\.) /.test(l)).length,
    tables: prose.filter((l) => /^\|/.test(l)).length,
    quotes: prose.filter((l) => l.startsWith(">")).length,
    blocks: text.split(/\n\s*\n/).filter((b) => b.trim()).length,
  };
}

/** A line of code without its natural-language comment. */
function withoutComments(info: string, line: string): string {
  let code = line;
  if (/^(java|ts|typescript|js|javascript|json|sql|asm)/.test(info))
    code = code.replace(/\s*(\/\/|--|;).*$/, "");
  if (/^(python|properties|bash|sh|toml|yaml)/.test(info))
    code = code.replace(/\s+#.*$/, "").replace(/^\s*#.*$/, "");
  return code.replace(/\/\*.*?\*\//g, "").trimEnd();
}

const posts = getAllPosts();
const pairs = [...new Set(posts.map((post) => post.contentId))].flatMap(
  (contentId) => {
    const versions = posts.filter((post) => post.contentId === contentId);
    const original = versions.find((v) => v.locale === v.originalLocale);
    return original
      ? versions
          .filter((v) => v !== original)
          .map((translation) => ({ contentId, original, translation }))
      : [];
  },
);

describe("translation parity", () => {
  it("compares every translated work with its original", () => {
    // 11 English originals translated to Portuguese, the English original
    // translated again (Portuguese -> English), and the first translation.
    expect(pairs).toHaveLength(13);
  });

  it.each(pairs.map((pair) => [pair.contentId, pair] as const))(
    "%s keeps the structure of its original",
    (_contentId, { original, translation }) => {
      const a = structureOf(original.slug);
      const b = structureOf(translation.slug);
      expect(b.headings).toEqual(a.headings);
      expect(b.blocks).toBe(a.blocks);
      expect(b.inlineCode).toEqual(a.inlineCode);
      expect(b.links).toEqual(a.links);
      expect(b.images).toEqual(a.images);
      expect(b.directives).toBe(a.directives);
      expect(b.lists).toBe(a.lists);
      expect(b.tables).toBe(a.tables);
      expect(b.quotes).toBe(a.quotes);
      expect(b.fences.map((f) => f.info)).toEqual(a.fences.map((f) => f.info));
      a.fences.forEach((fence, index) => {
        const other = b.fences[index]!;
        // `text` fences may hold quoted prose that is translated.
        if (fence.info === "text") return;
        expect(other.lines.map((l) => withoutComments(other.info, l))).toEqual(
          fence.lines.map((l) => withoutComments(fence.info, l)),
        );
      });
      expect(translation.tags).toEqual(original.tags);
      expect(translation.originalLocale).toBe(original.originalLocale);
    },
  );
});
