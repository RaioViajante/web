// @ts-check
import { defineConfig } from "astro/config";
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
