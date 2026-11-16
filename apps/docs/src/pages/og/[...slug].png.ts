import type { APIRoute } from "astro";
import {
	createSiteSocialImage,
	createSocialImage,
} from "@raioviajante/design/social-image";
import { socialKey } from "../../../../../seo/metadata";
import { LOCALE_IDS } from "../../../../../site/locales";
import { copyFor } from "../../lib/copy";
import { homePath } from "../../lib/docs";
import { getSeoPages, origin } from "../../lib/seo";
export async function getStaticPaths() {
	return (await getSeoPages()).map((page) => ({
		params: { slug: socialKey(page.path).replace(/\.png$/, "") },
		props: { title: page.title, path: page.path },
	}));
}
// The home is the family's card, with docs' search line; every other page
// keeps its own title card.
export const GET: APIRoute = ({ props }) => {
	const locale = LOCALE_IDS.find((id) => homePath(id) === props.path);
	return locale
		? createSiteSocialImage("docs", locale, copyFor(locale).home.line)
		: createSocialImage("docs", props.title, origin);
};
