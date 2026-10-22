import { getCollection, type CollectionEntry } from "astro:content";
import { navNumbers, type NavPage } from "./nav";
import { localizedPath, type LocaleId } from "../../../../site/locales";
import { documentRoutes, updatedAt, type DocumentRecord } from "./identity";
import { copyFor } from "./copy";

export type DocEntry = CollectionEntry<"docs">;

/** The closed set of English identities and URLs present before localization. */
const legacyEnglish = new Map([
	["projects/sweep", "/projects/sweep/"],
	["projects/sweep/cli", "/projects/sweep/cli/"],
	["raioviajante/design-language", "/raioviajante/design-language/"],
	["raioviajante/repository-conventions", "/raioviajante/repository-conventions/"],
]);

/** The version's declared public URL, never inferred from the entry ID. */
export function pathOf(entry: DocEntry) {
	return entry.data.path;
}

let inventory: Promise<DocEntry[]> | undefined;
export async function getPages(locale?: LocaleId) {
	inventory ??= getCollection("docs").then((entries) => {
		// Only the captured English migration inventory is pinned. New documents
		// can choose paths and stable identities independently of filenames.
		for (const entry of entries.filter((item) => item.data.locale === "en")) {
			const legacy = legacyEnglish.get(entry.id);
			if (legacy && (entry.data.contentId !== entry.id || pathOf(entry) !== legacy))
				throw new Error(`English document migration changed: ${entry.id}`);
		}
		documentRoutes(entries.map((entry): DocumentRecord => ({ id: entry.id, ...entry.data })));
		return entries.sort((a, b) => a.data.order - b.data.order);
	});
	const pages = await inventory;
	return locale ? pages.filter((entry) => entry.data.locale === locale) : pages;
}

export async function counterpartOf(entry: DocEntry) {
	return (await getPages()).find(
		(page) => page.data.contentId === entry.data.contentId && page.data.locale !== entry.data.locale,
	);
}

export function homePath(locale: LocaleId) {
	return localizedPath("docs", locale, "/");
}

/** A page's own nav label, lowercase. */
export function labelOf(entry: DocEntry) {
	return entry.data.label ?? entry.data.title.toLowerCase();
}

/** The pages as the navigation rules see them, in sidebar order. */
export async function navPages(locale: LocaleId = "en"): Promise<NavPage[]> {
	return (await getPages(locale)).map((entry) => ({
		path: pathOf(entry),
		label: labelOf(entry),
		sub: entry.data.sub,
	}));
}

/**
 * Sidebar items: the home page, every page in order (a `sub` page under the
 * one before it), then the search item added by the shell. Numbers follow
 * the order: 00. index, 01. sweep, 01.1 cli reference, 02. ...
 */
export async function navItems(locale: LocaleId = "en") {
	const pages = await navPages(locale);
	const numbers = navNumbers(pages);
	return [
		{ label: copyFor(locale).index, href: homePath(locale), number: "00.", sub: false },
		...pages.map((page, index) => ({
			label: page.label,
			href: page.path,
			number: numbers[index]!,
			sub: page.sub,
		})),
	];
}

/** Number of the search item: the one after the last top-level page. */
export async function searchNumber(locale: LocaleId = "en") {
	const items = await navItems(locale);
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
	return updatedAt(entry.data);
}

export function editUrl(entry: DocEntry) {
	return `https://github.com/RaioViajante/web/edit/main/apps/docs/${entry.filePath}`;
}
