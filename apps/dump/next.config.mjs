import createMDX from "@next/mdx";

/**
 * Syntax highlighting themes for `rehype-pretty-code` (Shiki). Highlighting
 * runs at build time, so no highlighter ships to the browser. Both themes are
 * emitted per token as `--shiki-light`/`--shiki-dark` CSS variables (see
 * `keepBackground: false` below and the `.prose pre code span` rules in
 * globals.css), so the active site theme picks the right one with no client
 * JS and no flicker.
 */
const shikiThemeDark = {
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

// Same restrained palette as `shikiThemeDark`, tuned for the warm-paper light
// theme instead of a stark white editor surface. Foreground/accent match
// `--fg`/`--accent` in `[data-theme="light"]`; the muted tone is that same
// 65%-of-`--fg`-over-`--bg` mix pre-computed to a literal hex, since a Shiki
// theme can't reference CSS custom properties.
const shikiThemeLight = {
  name: "dump-paper",
  type: "light",
  colors: {
    "editor.background": "#e5e3e0",
    "editor.foreground": "#201e1d",
  },
  tokenColors: [
    {
      settings: {
        background: "#e5e3e0",
        foreground: "#201e1d",
      },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#656361" },
    },
    {
      scope: ["string", "punctuation.definition.string"],
      settings: { foreground: "#656361" },
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
      settings: { foreground: "#4a3d68" },
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
        {
          theme: { light: shikiThemeLight, dark: shikiThemeDark },
          keepBackground: false,
          grid: false,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
