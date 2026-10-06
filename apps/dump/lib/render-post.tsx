import fs from "node:fs";
import path from "node:path";

import { evaluate } from "@mdx-js/mdx";
import {
  rehypeNumberSections,
  rehypeSoftBlocks,
  remarkSoftCallouts,
} from "@raioviajante/design/blocks";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import * as runtime from "react/jsx-runtime";

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
