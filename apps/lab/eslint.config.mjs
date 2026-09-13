import { defineConfig, globalIgnores } from "eslint/config";
import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/**", ".astro/**", "reference/**"]),
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs["flat/recommended"],
]);
