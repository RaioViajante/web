// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  vite: {
    environments: {
      prerender: { resolve: { external: ["@vercel/og", "harfbuzzjs"] } },
    },
  },
  integrations: [react()],
  site: "https://lab.raioviajante.com",
  trailingSlash: "always",
});
