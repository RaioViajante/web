import { isNotFoundPath, sitemapResponse } from "@raioviajante/design/seo";
import { getSeoPages, origin } from "../lib/seo";
export async function GET() {
	return sitemapResponse(
		origin,
		(await getSeoPages())
			.filter((page) => !isNotFoundPath(page.path))
			.map(({ path, lastmod }) => ({ path, lastmod })),
	);
}
