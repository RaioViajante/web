import { getPages, homePath, lastUpdated, legalPath, pathOf, searchPagePath } from "./docs";
import { LOCALE_IDS } from "../../../../site/locales";
import { notFoundSeo } from "../../../../seo/metadata";
import { siteOrigins } from "../../../../site/sites";
export const origin = siteOrigins.docs;
interface SeoPage {
	path: string;
	title: string;
	/** A real content date; omitted when unknown. */
	lastmod?: string;
}

/** Titles of the social cards of the static pages, one set per locale. */
const staticTitles = {
	en: { home: "technical documentation", search: "Search", terms: "Terms of Use", privacy: "Privacy Policy" },
	"pt-BR": { home: "Documentação técnica", search: "Busca", terms: "Termos de Uso", privacy: "Política de Privacidade" },
} satisfies Record<(typeof LOCALE_IDS)[number], Record<string, string>>;

export async function getSeoPages(): Promise<SeoPage[]> {
	return [
		...LOCALE_IDS.flatMap((locale) => [
			{ path: homePath(locale), title: staticTitles[locale].home },
			{ path: searchPagePath(locale), title: staticTitles[locale].search },
			{ path: legalPath(locale, "terms"), title: staticTitles[locale].terms },
			{ path: legalPath(locale, "privacy"), title: staticTitles[locale].privacy },
		]),
		notFoundSeo,
		...(await getPages()).map((page) => ({
			path: pathOf(page),
			title: page.data.title,
			// Only an explicit editorial date; git history is not a content date.
			lastmod: lastUpdated(page),
		})),
	];
}
