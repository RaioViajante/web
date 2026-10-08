import { siteOrigins } from "../../../../site/sites";
import type { APIRoute } from "astro";
import { getCollection, render } from "astro:content";
import { getSectionHeadings } from "@raioviajante/design/sections";
import type { SearchEntry } from "@raioviajante/design/search";

export const GET: APIRoute = async () => {
  const docs = await getCollection("docs");
  const entries: SearchEntry[] = (
    await Promise.all(
      docs.map(async (doc) => {
        const body = doc.body ?? "";
        const { remarkPluginFrontmatter } = await render(doc);
        const headings = getSectionHeadings(remarkPluginFrontmatter);
        const base = `${siteOrigins.docs}/${doc.id.replace(/\/index$/, "")}/`;
        const title = String(doc.data.title);
        const page: SearchEntry = {
          site: "docs",
          title,
          href: base,
          description: String(doc.data.description ?? ""),
          body,
        };
        const sections = headings
          .filter((heading) => heading.depth === 2 || heading.depth === 3)
          .map((heading): SearchEntry => ({
            site: "docs",
            title: heading.text,
            href: `${base}#${heading.slug}`,
            description: title,
          }));
        return [page, ...sections];
      }),
    )
  ).flat();
  return new Response(JSON.stringify(entries), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
