import createMDX from "@next/mdx";

/**
 * Syntax highlighting theme for `rehype-pretty-code` (Shiki). Highlighting runs
 * at build time, so no highlighter ships to the browser.
 */
const shikiTheme = {
  name: "dump-ink",
  type: "dark",
  colors: {
    "editor.background": "#201c29",
    "editor.foreground": "#eae6f0",
  },
  tokenColors: [
    {
      settings: {
        background: "#201c29",
        foreground: "#eae6f0",
      },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#8f88a3" },
    },
    {
      scope: ["string", "punctuation.definition.string"],
      settings: { foreground: "#8f88a3" },
    },
    {
      scope: [
        "keyword",
        "storage",
        "constant.numeric",
        "constant.language",
        "entity.name.function",
        "entity.name.label",
        "support.function",
        "support.type",
      ],
      settings: { foreground: "#b7a4dd" },
    },
  ],
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  // `.mdx` files under `app/` are treated as routes; `.md`/`.markdown` are not,
  // so plain notes in `content/` never accidentally become pages.
  pageExtensions: ["ts", "tsx", "mdx"],
};

const withMDX = createMDX({
  extension: /\.mdx$/,
  options: {
    // Plugins are passed as strings so they stay serializable for Turbopack.
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: [
      "rehype-slug",
      [
        "rehype-pretty-code",
        { theme: shikiTheme, keepBackground: false, grid: false },
      ],
    ],
  },
});

export default withMDX(nextConfig);
