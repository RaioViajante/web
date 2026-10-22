import { getPages, lastUpdated, pathOf } from "./docs";
import { localizedPath } from "../../../../site/locales";
import { notFoundSeo } from "../../../../seo/metadata";
import { siteOrigins } from "../../../../site/sites";
export const origin = siteOrigins.docs;
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
		{ path: localizedPath("docs", "pt-BR", "/"), title: "Documentação técnica" },
		{ path: localizedPath("docs", "pt-BR", "/search/"), title: "Busca" },
		{ path: "/terms/", title: "Terms of Use" },
		{ path: "/privacy/", title: "Privacy Policy" },
		notFoundSeo,
		...(await getPages()).map((page) => ({
			path: pathOf(page),
			title: page.data.title,
			// Only an explicit editorial date; git history is not a content date.
			lastmod: lastUpdated(page),
		})),
	];
}
