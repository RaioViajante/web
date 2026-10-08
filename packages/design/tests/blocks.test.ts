import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { rehypeSoftBlocks, remarkSoftCallouts } from "../blocks/rehype";
import { rehypeNumberSections, getSectionHeadings } from "../blocks/sections";
import { parseFenceMeta } from "../blocks/meta";
import { highlightLines } from "../blocks/highlight";
import { SYNTAX } from "../blocks/theme";

async function render(markdown: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkSoftCallouts)
    .use(remarkRehype)
    .use(rehypeSoftBlocks)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

describe("syntax theme", () => {
  it("mirrors the --syn-* tokens in tokens.css", () => {
    const css = readFileSync(
      new URL("../styles/tokens.css", import.meta.url),
      "utf8",
    );
    for (const [name, color] of Object.entries(SYNTAX)) {
      if (name === "punct") continue; // --syn-punct aliases --fg-2
      expect(css).toContain(`--syn-${name}: ${color};`);
    }
    expect(css).toContain(`--fg-2: ${SYNTAX.punct};`);
  });

  it("classes tokens instead of inlining colors", async () => {
    const [line] = await highlightLines("def load(path):", "python");
    expect(line.some((token) => token.cls === "keyword")).toBe(true);
    expect(line.some((token) => token.cls === "function")).toBe(true);
  });
});

describe("fence meta", () => {
  it("parses title, numbers, highlights and notes", () => {
    const meta = parseFenceMeta(
      'title="boot.asm" showLineNumbers {8-9,12} note="a" note="b"',
    );
    expect(meta).toMatchObject({
      title: "boot.asm",
      numbered: true,
      highlight: [8, 9, 12],
      notes: ["a", "b"],
    });
  });
});

describe("markdown pipeline", () => {
  it("renders a code block per the markup contract", async () => {
    const html = await render(
      '```python title="sweep/classify.py"\nx = 1\n```',
    );
    expect(html).toContain('class="block"');
    expect(html).toContain(
      '<span class="block__file">sweep/classify.py</span>',
    );
    expect(html).toContain('<span class="line" data-n="1">');
    expect(html).toContain("block__copy");
    expect(html).not.toContain('\n<span class="line"');
  });

  it("numbers lines and highlights ranges on request", async () => {
    const html = await render("```asm showLineNumbers {2}\na\nb\nc\n```");
    expect(html).toContain("block--numbered");
    expect(html).toMatch(/class="line is-hl" data-n="2"/);
  });

  it("builds a terminal that separates commands from output", async () => {
    const html = await render(
      "```sh terminal\n$ nasm -f bin boot.asm\nSeaBIOS\n```",
    );
    expect(html).toContain("block--terminal");
    expect(html).toContain(
      '<span class="term-cmd">nasm -f bin boot.asm</span>',
    );
    expect(html).toContain('class="line term-out"');
    expect(html).toContain("copy commands");
  });

  it("builds a diff with counts", async () => {
    const html = await render(
      '```diff title="c.py"\n keep\n-old\n+new\n+newer\n```',
    );
    expect(html).toContain("block--diff");
    expect(html).toContain('<span class="add">+2</span>');
    expect(html).toContain('<span class="del">−1</span>');
  });

  it("collapses blocks over 20 lines", async () => {
    const code = Array.from({ length: 25 }, (_, i) => `line ${i}`).join("\n");
    const html = await render("```text\n" + code + "\n```");
    expect(html).toContain("block--collapsible is-collapsed");
    expect(html).toContain("show all 25 lines");
  });

  it("merges adjacent fences of one group into tabs", async () => {
    const html = await render(
      '```python title="a.py" group="x"\n1\n```\n\n```toml title="b.toml" group="x"\n2\n```',
    );
    expect(html).toContain("block--tabs");
    expect(html).toContain('role="tablist"');
    expect(html.match(/role="tabpanel"/g)).toHaveLength(2);
    expect(html).toContain("hidden");
  });

  it("renders annotated code with markers and notes", async () => {
    const html = await render('```asm note="pads"\ntimes 510 db 0 [!1]\n```');
    expect(html).toContain('<span class="mark">1</span>');
    expect(html).toContain('class="block__notes"');
  });

  it("renders a file tree with branch and directory classes", async () => {
    const html = await render(
      "```tree\nproject/\n├─ src/\n│  └─ main.asm\n```",
    );
    expect(html).toContain("tree-branch");
    expect(html).toContain("tree-dir");
  });

  it("renders callouts from directives", async () => {
    const html = await render(
      ":::careful\nUse a VM.\n:::\n\n:::til[Fun fact]\nEnter has lore.\n:::",
    );
    expect(html).toContain("callout callout--careful");
    expect(html).toContain('<span class="callout__label">Careful</span>');
    expect(html).toContain('<span class="callout__label">Fun fact</span>');
  });

  it("wraps tables and restyles footnotes", async () => {
    const html = await render(
      "| a | b |\n|---|---|\n| 1 | 2 |\n\nText[^1].\n\n[^1]: The note.",
    );
    expect(html).toContain('<div class="table-block"><table>');
    expect(html).toContain('<ol class="footnotes"');
    expect(html).toContain("The note.");
  });

  it("keeps stray colons as text", async () => {
    const html = await render("at 10:30 or :smile today");
    expect(html).toContain(":smile");
  });
});

describe("section numbers", () => {
  async function numbered(markdown: string) {
    const file = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeNumberSections)
      .use(rehypeStringify)
      .process(markdown);
    return String(file);
  }

  it("shows the number in front of each top-level h2 and leaves h3 alone", async () => {
    const html = await numbered("## One\n\n### Inner\n\n## Two\n");
    expect(html).toContain(
      '<h2><span class="rv-num" aria-hidden="true">01.</span><span>One</span></h2>',
    );
    expect(html).toContain(">01.1</span><span>Two</span>");
    expect(html).toContain("<h3>Inner</h3>");
  });

  async function captured(markdown: string, captureHeadings = true) {
    return unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective)
      .use(remarkSoftCallouts)
      .use(remarkRehype)
      .use(rehypeSoftBlocks)
      .use(rehypeSlug)
      .use(rehypeNumberSections, { captureHeadings })
      .use(rehypeStringify)
      .process(markdown);
  }

  function headings(file: Awaited<ReturnType<typeof captured>>) {
    return getSectionHeadings(
      (file.data.astro as { frontmatter: Record<string, unknown> }).frontmatter,
    );
  }

  it("changes Classification's visual number without changing its title or id", async () => {
    const before = await captured("## Overview\n\n## Classification\n");
    const after = await captured(
      "## Overview\n\n## New\n\n## Classification\n",
    );
    expect(String(before)).toContain(
      '<h2 id="classification"><span class="rv-num" aria-hidden="true">01.1</span><span>Classification</span></h2>',
    );
    expect(String(after)).toContain(
      '<h2 id="classification"><span class="rv-num" aria-hidden="true">01.2</span><span>Classification</span></h2>',
    );
    expect(headings(before).at(-1)).toEqual({
      depth: 2,
      slug: "classification",
      text: "Classification",
      number: "01.1",
    });
    expect(headings(after).at(-1)).toEqual({
      depth: 2,
      slug: "classification",
      text: "Classification",
      number: "01.2",
    });
  });

  it("preserves the slugger's duplicate-heading suffixes", async () => {
    const file = await captured("## Notes\n\n## Notes\n\n### Notes\n");
    expect(headings(file).map((heading) => heading.slug)).toEqual([
      "notes",
      "notes-1",
      "notes-2",
    ]);
    expect(
      [...String(file).matchAll(/<h[23] id="([^"]*)"/g)].map(
        (match) => match[1],
      ),
    ).toEqual(["notes", "notes-1", "notes-2"]);
  });

  it.each([
    ["blockquote", "> ## Nested"],
    ["callout", ":::note\n## Nested\n:::"],
    ["list", "- ## Nested"],
    ["h3", "### Nested"],
  ])(
    "captures clean titles with an intervening %s heading",
    async (_kind, nested) => {
      const file = await captured(
        `## Overview\n\n${nested}\n\n## Classification`,
      );
      expect(headings(file).map((heading) => heading.text)).toEqual([
        "Overview",
        "Nested",
        "Classification",
      ]);
      expect(headings(file)[1]).not.toHaveProperty("number");
      expect(headings(file).filter((heading) => heading.number)).toEqual([
        { depth: 2, slug: "overview", text: "Overview", number: "01." },
        {
          depth: 2,
          slug: "classification",
          text: "Classification",
          number: "01.1",
        },
      ]);
      expect(String(file)).toContain(
        '<h2 id="classification"><span class="rv-num" aria-hidden="true">01.1</span><span>Classification</span></h2>',
      );
      if (_kind === "callout")
        expect(String(file)).toContain('class="callout"');
    },
  );

  it("preserves authored numbers and inline title text without prefix stripping", async () => {
    const file = await captured("## 01.2 *Classification* and `rules`\n");
    expect(headings(file)[0]?.text).toBe("01.2 Classification and rules");
  });

  it("does not retain the generated footnote heading removed by soft blocks", async () => {
    const file = await captured("## Overview\n\nA note[^1].\n\n[^1]: Details.");
    expect(headings(file).map((heading) => heading.slug)).toEqual(["overview"]);
    expect(String(file)).toContain('class="footnotes"');
  });

  it("keeps the default Dump pipeline output unchanged when capture is enabled", async () => {
    const markdown =
      "## Overview\n\n:::note\n## Nested\n::: \n\n### Inner\n\n## Classification\n\n## Classification";
    // Dump keeps its original slug -> number -> blocks pipeline, without capture.
    const normal = await unified()
      .use(remarkParse)
      .use(remarkDirective)
      .use(remarkSoftCallouts)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeNumberSections)
      .use(rehypeSoftBlocks)
      .use(rehypeStringify)
      .process(markdown);
    const semantic = await captured(markdown);
    expect(String(semantic)).toBe(String(normal));
    expect(normal.data.astro).toBeUndefined();
    expect(headings(semantic).at(-1)?.slug).toBe("classification-1");
  });
});
