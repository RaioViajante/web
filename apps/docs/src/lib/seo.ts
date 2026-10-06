import { getPages, pathOf } from "./docs";
import { notFoundSeo } from "@raioviajante/design/seo";
export const origin = "https://docs.raioviajante.com";
export async function getSeoPages() {
	return [
		{ path: "/", title: "technical documentation" },
		{ path: "/search/", title: "Search" },
		{ path: "/terms/", title: "Terms of Use" },
		{ path: "/privacy/", title: "Privacy Policy" },
		notFoundSeo,
		...(await getPages()).map((page) => ({
			path: pathOf(page),
			title: page.data.title,
		})),
	];
}
