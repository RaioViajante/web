import fs from "node:fs";
import path from "node:path";

import { evaluate } from "@mdx-js/mdx";
import {
  rehypeSoftBlocks,
  remarkSoftCallouts,
} from "@raioviajante/design/blocks";
import type { Element, Root } from "hast";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import * as runtime from "react/jsx-runtime";

import { sectionNumber } from "@/lib/section-number";

/**
 * Numbers a post's `##` headings in document order (`01.`, `01.1`, `01.2`, …)
 * with the same function the "on this page" list uses.
 */
function rehypeNumberSections() {
  return (tree: Root) => {
    let index = 0;
    for (const node of tree.children) {
      if (node.type !== "element" || node.tagName !== "h2") continue;
      const number: Element = {
        type: "element",
        tagName: "span",
        properties: { className: ["rv-num"], ariaHidden: "true" },
        children: [{ type: "text", value: sectionNumber(index) }],
      };
      node.children.unshift(number);
      index += 1;
    }
  };
}

/**
 * Compile a post's MDX with the shared soft-block pipeline. Runs on the
 * server at build time: the page ships no markdown runtime.
 */
export async function renderPost(slug: string) {
  const source = fs.readFileSync(
    path.join(process.cwd(), "content", "posts", `${slug}.mdx`),
    "utf8",
  );
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [
      remarkFrontmatter,
      remarkGfm,
      remarkDirective,
      remarkSoftCallouts,
    ],
    rehypePlugins: [rehypeSlug, rehypeNumberSections, rehypeSoftBlocks],
  });
  return Content;
}
