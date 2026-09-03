import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "next-env.d.ts",
      "content/**",
      "**/*.mdx",
    ],
  },
  ...nextCoreWebVitals,
  // Keep ESLint out of Prettier's way: this must stay last.
  prettier,
];

export default config;
