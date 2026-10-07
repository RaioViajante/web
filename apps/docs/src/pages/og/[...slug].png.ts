import type { APIRoute } from "astro";
import { createSocialImage } from "@raioviajante/design/social-image";
import { socialKey } from "../../../../../seo/metadata";
import { getSeoPages, origin } from "../../lib/seo";
export async function getStaticPaths() {
	return (await getSeoPages()).map((page) => ({
		params: { slug: socialKey(page.path).replace(/\.png$/, "") },
		props: { title: page.title },
	}));
}
export const GET: APIRoute = ({ props }) =>
	createSocialImage("docs", props.title, origin);
