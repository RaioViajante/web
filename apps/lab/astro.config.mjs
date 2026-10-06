// @ts-check
import { defineConfig } from "astro/config";
import { staticHeaders } from "../../security/headers.ts";
import react from "@astrojs/react";

export default defineConfig({
  server: ({ command }) => ({
    headers:
      command === "preview"
        ? Object.fromEntries(
            staticHeaders("lab").map(({ key, value }) => [key, value]),
          )
        : {},
  }),
  build: { inlineStylesheets: "never" },
  vite: {
    build: { assetsInlineLimit: 0 },
    environments: {
      prerender: { resolve: { external: ["@vercel/og", "harfbuzzjs"] } },
    },
  },
  integrations: [react()],
  site: "https://lab.raioviajante.com",
  trailingSlash: "always",
});
