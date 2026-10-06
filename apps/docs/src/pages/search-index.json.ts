import type { APIRoute } from "astro";
import { getCollection, render } from "astro:content";
import type { SearchEntry } from "@raioviajante/design/search";

export const GET: APIRoute = async () => {
  const docs = await getCollection("docs");
  const entries: SearchEntry[] = (
    await Promise.all(
      docs.map(async (doc) => {
        const body = doc.body ?? "";
        const { headings } = await render(doc);
        const base = `https://docs.raioviajante.com/${doc.id.replace(/\/index$/, "")}/`;
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
          .map((heading, index): SearchEntry => ({
            site: "docs",
            title: heading.text,
            href: `${base}#${heading.slug}`,
            description: title,
            number: `${String(index + 1).padStart(2, "0")}.`,
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
