import { getPages, pathOf } from "./docs";
import { notFoundSeo } from "@raioviajante/design/seo";
export const origin = "https://docs.raioviajante.com";
interface SeoPage {
	path: string;
	title: string;
	/** A real content date; omitted when unknown. */
	lastmod?: string;
}

export async function getSeoPages(): Promise<SeoPage[]> {
	return [
		{ path: "/", title: "technical documentation" },
		{ path: "/search/", title: "Search" },
		{ path: "/terms/", title: "Terms of Use" },
		{ path: "/privacy/", title: "Privacy Policy" },
		notFoundSeo,
		...(await getPages()).map((page) => ({
			path: pathOf(page),
			title: page.data.title,
			// Only an explicit editorial date; git history is not a content date.
			lastmod: page.data.lastUpdated,
		})),
	];
}
