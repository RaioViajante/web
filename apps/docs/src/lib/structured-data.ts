import { socialUrl } from "../../../../seo/metadata";
import type { LocaleId } from "../../../../site/locales";
import {
	breadcrumbJsonLd,
	inLanguageOf,
	webPageRef,
	websiteId,
	websiteJsonLd,
} from "../../../../seo/structured-data";
import { getPages, homePath, lastUpdated, pathOf, type DocEntry } from "./docs";
import { parentIndex } from "./nav";
import { origin } from "./seo";
import { copyFor } from "./copy";

export const docsDescription = copyFor("en").description;

/**
 * The home page: the site identity, which every page's `isPartOf` points at.
 * No author: nothing the docs publish says who writes them (the content
 * LICENSE names a copyright holder, which is not the same claim).
 */
export const homeJsonLd = (locale: LocaleId = "en") => [
	websiteJsonLd(
		origin,
		"docs",
		copyFor(locale).description,
		{ languages: ["en", "pt-BR"] },
	),
];

/**
 * A documentation page: `TechArticle` plus a breadcrumb that follows the
 * navigation (docs, the page it is listed under, the page), not URL segments:
 * the `projects/` and `raioviajante/` folders have no pages of their own.
 * `dateModified` is the explicit `lastUpdated` frontmatter date only. Git
 * history is not used: a commit can be a design or tooling change, not an edit
 * of the documentation. No publication date exists, so none is claimed.
 */
export async function pageJsonLd(entry: DocEntry) {
	const locale = entry.data.locale;
	const pages = await getPages(locale);
	const index = pages.findIndex((page) => page.id === entry.id);
	const nav = pages.map((page) => ({ path: pathOf(page), label: page.data.title, sub: page.data.sub }));
	const parentAt = parentIndex(nav, index);
	const parent = parentAt === undefined ? undefined : pages[parentAt];
	const path = pathOf(entry);
	const url = new URL(path, origin).href;
	const modified = lastUpdated(entry);
	return [
		{
			"@type": "TechArticle",
			headline: entry.data.title,
			description: entry.data.description,
			url,
			mainEntityOfPage: webPageRef(url, locale),
			inLanguage: inLanguageOf(locale),
			isPartOf: { "@id": websiteId(origin) },
			image: socialUrl(origin, path),
			...(modified ? { dateModified: modified } : {}),
		},
		breadcrumbJsonLd(origin, [
			["docs", homePath(locale)],
			...(parent ? [[parent.data.title, pathOf(parent)] as [string, string]] : []),
			[entry.data.title, path],
		]),
	];
}
