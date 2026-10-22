import { render } from "astro:content";
import { getSectionHeadings } from "@raioviajante/design/sections";
import type { SearchEntry } from "@raioviajante/design/search";
import type { LocaleId } from "../../../../site/locales";
import { siteOrigins } from "../../../../site/sites";
import { getPages, pathOf } from "./docs";

export async function searchIndex(locale: LocaleId) {
	const docs = await getPages(locale);
	const entries: SearchEntry[] = (await Promise.all(docs.map(async (doc) => {
		const { remarkPluginFrontmatter } = await render(doc);
		const headings = getSectionHeadings(remarkPluginFrontmatter);
		const base = `${siteOrigins.docs}${pathOf(doc)}`;
		const title = doc.data.title;
		return [
			{ site: "docs", locale, contentId: doc.data.contentId, title, href: base, description: doc.data.description, body: doc.body ?? "" },
			...headings.filter((heading) => heading.depth === 2 || heading.depth === 3).map((heading) => ({
				site: "docs" as const, locale, contentId: doc.data.contentId, title: heading.text, href: `${base}#${heading.slug}`, description: title,
			})),
		] satisfies SearchEntry[];
	}))).flat();
	return new Response(JSON.stringify(entries), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}
