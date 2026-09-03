import createMDX from "@next/mdx";

/**
 * Syntax highlighting theme for `rehype-pretty-code` (Shiki). Highlighting runs
 * at build time, so no highlighter ships to the browser.
 */
const shikiTheme = "github-light";

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
      ["rehype-pretty-code", { theme: shikiTheme, keepBackground: false }],
    ],
  },
});

export default withMDX(nextConfig);
