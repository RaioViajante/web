import { getCollection, type CollectionEntry } from "astro:content";

export type DocEntry = CollectionEntry<"docs">;


/** The page's URL path: `projects/sweep/index` -> `/projects/sweep/`. */
export function pathOf(entry: DocEntry) {
	return `/${entry.id.replace(/\/?index$/, "")}/`.replace("//", "/");
}

export async function getPages() {
	return (await getCollection("docs")).sort((a, b) => a.data.order - b.data.order);
}

/** A page's own nav label, lowercase. */
export function labelOf(entry: DocEntry) {
	return entry.data.label ?? entry.data.title.toLowerCase();
}

/**
 * Sidebar items: the home page, every page in order (a `sub` page under the
 * one before it), then the search item added by the shell. Numbers follow
 * the order: 00. index, 01. sweep, 01.1 cli reference, 02. ...
 */
export async function navItems() {
	const pages = await getPages();
	let number = 0;
	return [
		{ label: "index", href: "/", number: "00.", sub: false },
		...pages.map((entry) => {
			if (!entry.data.sub) number += 1;
			return {
				label: labelOf(entry),
				href: pathOf(entry),
				number: entry.data.sub
					? `${String(number).padStart(2, "0")}.1`
					: `${String(number).padStart(2, "0")}.`,
				sub: entry.data.sub,
			};
		}),
	];
}

/** Number of the search item: the one after the last page. */
export async function searchNumber() {
	const items = await navItems();
	const top = items.filter((item) => !item.sub).length;
	return `${String(top).padStart(2, "0")}.`;
}

/**
 * Only an explicit `lastUpdated` frontmatter date. Git history is not used: a
 * commit can be a design or tooling change rather than an edit of the page,
 * so a commit date would claim an update that did not happen. No date is shown
 * (or published to search engines) when the page has none.
 */
export function lastUpdated(entry: DocEntry) {
	return entry.data.lastUpdated;
}

export function editUrl(entry: DocEntry) {
	return `https://github.com/RaioViajante/web/edit/main/apps/docs/${entry.filePath}`;
}
