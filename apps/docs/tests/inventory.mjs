import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The published documents, read from the content files rather than listed in
 * each test, so adding a page does not mean editing every assertion that
 * counts or enumerates pages.
 */
const content = fileURLToPath(new URL("../src/content/docs/", import.meta.url));

const files = (directory) =>
	readdirSync(directory).flatMap((name) => {
		const path = join(directory, name);
		return statSync(path).isDirectory() ? files(path) : name.endsWith(".md") ? [path] : [];
	});

function frontmatter(path) {
	const [, front] = /^---\n([\s\S]*?)\n---\n/.exec(readFileSync(path, "utf8"));
	const data = Object.fromEntries(
		[...front.matchAll(/^([A-Za-z]+): ?(.*)$/gm)].map(([, key, value]) => [key, value.trim()]),
	);
	return {
		contentId: data.contentId,
		locale: data.locale,
		path: data.path,
		order: Number(data.order),
		sub: data.sub === "true",
		group: data.group,
		label: data.label ?? data.title.toLowerCase(),
	};
}

const documents = files(content).map(frontmatter);

/** Documents of one locale in sidebar order. */
export const documentsOf = (locale) =>
	documents.filter((document) => document.locale === locale).sort((a, b) => a.order - b.order);

/** The project ids with a documentation page of their own (`projects/<id>`). */
export const documentedProjects = new Set(
	documentsOf("en")
		.filter(({ contentId }) => /^projects\/[a-z0-9-]+$/.test(contentId))
		.map(({ contentId }) => contentId.slice("projects/".length)),
);

/** The public path without its slashes: `/pt/projetos/sweep/` becomes `pt/projetos/sweep`. */
export const bare = (path) => path.replace(/^\/|\/$/g, "");
