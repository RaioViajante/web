import createMDX from "@next/mdx";

const shikiTheme = {
  name: "raioviajante-editorial",
  type: "dark",
  colors: {
    "editor.background": "#202020",
    "editor.foreground": "#ececec",
  },
  tokenColors: [
    { settings: { background: "#202020", foreground: "#ececec" } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#7b818a", fontStyle: "italic" },
    },
    {
      scope: ["string", "punctuation.definition.string"],
      settings: { foreground: "#a8c791" },
    },
    { scope: ["keyword", "storage"], settings: { foreground: "#d8bd84" } },
    {
      scope: ["entity.name.type", "support.type"],
      settings: { foreground: "#bfa6d9" },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: { foreground: "#8fb8d6" },
    },
    {
      scope: ["constant.numeric", "constant.language"],
      settings: { foreground: "#de9f8c" },
    },
    { scope: ["punctuation"], settings: { foreground: "#9aa0a8" } },
  ],
};

const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  async headers() {
    return [
      {
        source: "/giscus.css",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://giscus.app" },
        ],
      },
    ];
  },
};
const withMDX = createMDX({
  extension: /\.mdx$/,
  options: {
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
