import assert from "node:assert/strict";
import { test } from "node:test";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import rehypeSlug from "rehype-slug";
import { getSectionHeadings, rehypeNumberSections } from "@raioviajante/design/sections";

test("Astro persists semantic headings even when its later collection contains numbers", async () => {
  const processor = await createMarkdownProcessor({
    syntaxHighlight: false,
    rehypePlugins: [rehypeSlug, [rehypeNumberSections, { captureHeadings: true }]],
  });
  const { metadata, code } = await processor.render(
    "## Overview\n\n> ## Nested\n\n### Inner\n\n## Classification",
    { frontmatter: { title: "Sweep" } },
  );
  assert.equal(metadata.headings.at(-1).text, "01.1Classification");
  assert.equal(metadata.frontmatter.title, "Sweep");
  // Astro stores this as JSON and exposes it as remarkPluginFrontmatter.
  const headings = getSectionHeadings(JSON.parse(JSON.stringify(metadata.frontmatter)));
  assert.deepEqual(headings.map(({ text }) => text), ["Overview", "Nested", "Inner", "Classification"]);
  assert.deepEqual(headings.filter(({ number }) => number), [
    { depth: 2, slug: "overview", text: "Overview", number: "01." },
    { depth: 2, slug: "classification", text: "Classification", number: "01.1" },
  ]);
  assert.match(code, /id="classification"><span class="rv-num" aria-hidden="true">01\.1<\/span><span>Classification<\/span>/);
});
