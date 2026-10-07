import { socialUrl } from "../../../../seo/metadata";
import { breadcrumbJsonLd, websiteId, websiteJsonLd } from "../../../../seo/structured-data";
import { getPages, pathOf, type DocEntry } from "./docs";
import { origin } from "./seo";

export const docsDescription =
	"Public technical documentation for projects and systems built under RaioViajante.";

/**
 * The home page: the site identity, which every page's `isPartOf` points at.
 * No author: nothing the docs publish says who writes them (the content
 * LICENSE names a copyright holder, which is not the same claim).
 */
export const homeJsonLd = () => [websiteJsonLd(origin, "docs", docsDescription)];

/**
 * A documentation page: `TechArticle` plus a breadcrumb that follows the
 * navigation (docs, the page it is listed under, the page), not URL segments:
 * the `projects/` and `raioviajante/` folders have no pages of their own.
 * `dateModified` is the explicit `lastUpdated` frontmatter date only. Git
 * history is not used: a commit can be a design or tooling change, not an edit
 * of the documentation. No publication date exists, so none is claimed.
 */
export async function pageJsonLd(entry: DocEntry) {
	const pages = await getPages();
	const index = pages.findIndex((page) => page.id === entry.id);
	const parent = entry.data.sub
		? pages.slice(0, index).reverse().find((page) => !page.data.sub)
		: undefined;
	const path = pathOf(entry);
	const url = new URL(path, origin).href;
	const modified = entry.data.lastUpdated;
	return [
		{
			"@type": "TechArticle",
			headline: entry.data.title,
			description: entry.data.description,
			url,
			mainEntityOfPage: { "@type": "WebPage", "@id": url },
			inLanguage: "en",
			isPartOf: { "@id": websiteId(origin) },
			image: socialUrl(origin, path),
			...(modified ? { dateModified: modified } : {}),
		},
		breadcrumbJsonLd(origin, [
			["docs", "/"],
			...(parent ? [[parent.data.title, pathOf(parent)] as [string, string]] : []),
			[entry.data.title, path],
		]),
	];
}
