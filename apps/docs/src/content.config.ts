import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const collections = {
	docs: defineCollection({
		loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			/** One line under the title; falls back to the description. */
			tagline: z.string().optional(),
			/** Sidebar and prev/next label; falls back to the lowercased title. */
			label: z.string().optional(),
			/** Position in the sidebar, prev/next and the home page. */
			order: z.number(),
			/** Listed under the page before it (`01.1 cli reference`). */
			sub: z.boolean().default(false),
			/** Home section: the folder the page lives in. */
			group: z.enum(["projects", "raioviajante"]),
			/** A plain word: active, stable, standard, deprecated. */
			status: z.string(),
			/** The rest of the meta row, after the status word. */
			meta: z.array(z.string()).default([]),
			/** Explicit editorial date; takes priority over git history. */
			lastUpdated: z.iso.date().optional(),
			/** The project's source repository. */
			source: z.url().optional(),
			/** One line on the home page. */
			summary: z.string(),
		}),
	}),
};
