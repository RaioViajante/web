// @ts-check
import { defineConfig } from "astro/config";
import { staticHeaders } from "../../security/headers.ts";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";
import remarkDirective from "remark-directive";
import {
	rehypeNumberSections,
	rehypeSoftBlocks,
	rehypeSteps,
	remarkSoftCallouts,
} from "@raioviajante/design/blocks";

export default defineConfig({
	server: ({ command }) => ({
		headers: command === "preview"
			? Object.fromEntries(staticHeaders("docs").map(({ key, value }) => [key, value]))
			: {},
	}),
	build: { inlineStylesheets: "never" },
	vite: {
		build: { assetsInlineLimit: 0 },
		environments: {
			prerender: { resolve: { external: ["@vercel/og", "harfbuzzjs"] } },
		},
	},
	site: "https://docs.raioviajante.com",
	trailingSlash: "always",
	integrations: [react()],
	markdown: {
		// The shared soft blocks highlight code at build time, with the shared theme.
		syntaxHighlight: false,
		processor: unified({
			remarkPlugins: [remarkDirective, remarkSoftCallouts],
			rehypePlugins: [rehypeNumberSections, rehypeSteps, rehypeSoftBlocks],
		}),
	},
});
